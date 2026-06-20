import asyncio
import os
from dataclasses import dataclass
from typing import Literal

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_ext.models.openai import OpenAIChatCompletionClient


MessageType = Literal["assignment", "plan", "risk_review", "test_plan", "accepted_package"]


@dataclass(frozen=True)
class TranscriptEvent:
    turn: int
    sender: str
    recipient: str
    message_type: MessageType
    task_id: str
    content: str


def build_model_client() -> OpenAIChatCompletionClient:
    return OpenAIChatCompletionClient(
        model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        api_key=os.environ["OPENAI_API_KEY"],
    )


def build_delivery_team(model_client: OpenAIChatCompletionClient) -> RoundRobinGroupChat:
    manager = AssistantAgent(
        name="delivery_manager",
        model_client=model_client,
        system_message=(
            "Own final acceptance. Assign planning, risk review, and test planning. "
            "End only when a reviewed package is ready. Include ACCEPTED only in the final response."
        ),
    )
    planner = AssistantAgent(
        name="delivery_planner",
        model_client=model_client,
        system_message="Create a scoped implementation plan. Do not approve the final package.",
    )
    reviewer = AssistantAgent(
        name="risk_reviewer",
        model_client=model_client,
        system_message="Identify blockers, policy risks, missing ownership, and rollback gaps.",
    )
    tester = AssistantAgent(
        name="test_planner",
        model_client=model_client,
        system_message="Create release-blocking tests, transcript evals, and acceptance gates.",
    )

    termination = TextMentionTermination("ACCEPTED") | MaxMessageTermination(8)
    return RoundRobinGroupChat(
        participants=[manager, planner, reviewer, tester],
        termination_condition=termination,
    )


def normalize_transcript(raw_messages: list[object], task_id: str) -> list[TranscriptEvent]:
    events: list[TranscriptEvent] = []
    type_by_sender: dict[str, MessageType] = {
        "delivery_manager": "assignment",
        "delivery_planner": "plan",
        "risk_reviewer": "risk_review",
        "test_planner": "test_plan",
    }

    for index, message in enumerate(raw_messages, start=1):
        sender = str(getattr(message, "source", "unknown"))
        content = str(getattr(message, "content", ""))
        message_type = type_by_sender.get(sender, "accepted_package")
        if sender == "delivery_manager" and "ACCEPTED" in content:
            message_type = "accepted_package"
        events.append(
            TranscriptEvent(
                turn=index,
                sender=sender,
                recipient="team",
                message_type=message_type,
                task_id=task_id,
                content=content,
            )
        )

    return events


def evaluate_transcript(events: list[TranscriptEvent], stop_reason: str) -> dict[str, object]:
    failures: list[str] = []
    senders = {event.sender for event in events}
    message_types = [event.message_type for event in events]

    for required_sender in ["delivery_manager", "delivery_planner", "risk_reviewer", "test_planner"]:
        if required_sender not in senders:
            failures.append(f"missing_role:{required_sender}")

    required_order: list[MessageType] = ["assignment", "plan", "risk_review", "test_plan", "accepted_package"]
    positions = {kind: message_types.index(kind) for kind in required_order if kind in message_types}
    for kind in required_order:
        if kind not in positions:
            failures.append(f"missing_message_type:{kind}")
    if len(positions) == len(required_order):
        ordered_positions = [positions[kind] for kind in required_order]
        if ordered_positions != sorted(ordered_positions):
            failures.append("invalid_turn_order")

    if not events or events[-1].message_type != "accepted_package":
        failures.append("missing_final_owner_acceptance")
    if stop_reason not in {"accepted", "max_messages"}:
        failures.append("unexpected_stop_reason")

    return {"status": "pass" if not failures else "fail", "failures": failures}


async def run_team() -> None:
    model_client = build_model_client()
    team = build_delivery_team(model_client)
    result = await team.run(
        task=(
            "Create a delivery package for adding native framework examples. "
            "Planner, reviewer, and tester must each contribute before final acceptance."
        )
    )
    events = normalize_transcript(result.messages, task_id="delivery-native-autogen")
    stop_reason = "accepted" if any("ACCEPTED" in event.content for event in events) else "max_messages"
    print("events:", events)
    print("eval:", evaluate_transcript(events, stop_reason))
    await model_client.close()


if __name__ == "__main__":
    asyncio.run(run_team())
