import json
import time
import uuid
from cryptography.fernet import Fernet


key = Fernet.generate_key()
fernet = Fernet(key)


def encrypt_payload(payload):
    return fernet.encrypt(json.dumps(payload).encode()).decode()


def decrypt_payload(token):
    return json.loads(fernet.decrypt(token.encode()).decode())


def authorize_envelope(envelope, required_audience, required_scope, now):
    if envelope['auth']['audience'] != required_audience:
        return {'decision': 'deny', 'reason': 'wrong_audience'}

    if required_scope not in envelope['auth']['scopes']:
        return {'decision': 'deny', 'reason': 'missing_scope'}

    if envelope['expires_at'] <= now:
        return {'decision': 'deny', 'reason': 'expired_message'}

    return {'decision': 'allow', 'reason': 'authorized'}


def trace(event):
    print(json.dumps(event))


def main():
    trace_id = str(uuid.uuid4())
    envelope = {
        'trace_id': trace_id,
        'message_id': str(uuid.uuid4()),
        'idempotency_key': f'agent-message:{uuid.uuid4()}',
        'issued_at': int(time.time()),
        'expires_at': int(time.time()) + 60,
        'caller': {
            'subject': 'agent:customer-support',
            'tenant_id': 'tenant_a',
            'service_id': 'support-agent-runtime',
        },
        'auth': {
            'issuer': 'https://identity.example.test',
            'audience': 'billing-agent',
            'scopes': ['agent:delegate', 'refund:draft'],
        },
        'capability': 'tool_call',
        'encrypted_payload': encrypt_payload({
            'tool': 'refunds.draft_refund',
            'order_id': 'ord_redacted',
            'amount_cents': 2500,
        }),
    }

    trace({
        'trace_id': trace_id,
        'event': 'secure_message_received',
        'subject': envelope['caller']['subject'],
        'scopes': envelope['auth']['scopes'],
    })

    authorization = authorize_envelope(
        envelope,
        required_audience='billing-agent',
        required_scope='refund:draft',
        now=int(time.time()),
    )

    trace({
        'trace_id': trace_id,
        'event': 'authorization_decision',
        'decision': authorization['decision'],
        'reason': authorization['reason'],
    })

    if authorization['decision'] == 'deny':
        return

    payload = decrypt_payload(envelope['encrypted_payload'])
    trace({'trace_id': trace_id, 'event': 'payload_decrypted_after_authorization'})
    print(json.dumps(payload))


if __name__ == '__main__':
    main()
