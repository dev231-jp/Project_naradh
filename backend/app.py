from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import threading
import time
import uuid

from chatbot.assistant import STORE as CHAT_STORE, initial_message_for_alert, build_bot_response_text

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage
alerts_store = []
devices_store = [
    {'name': 'IoT-Sensor-001', 'ip': '192.168.1.10', 'last_seen': datetime.now().isoformat(), 'status': 'OK'},
    {'name': 'Security-Camera-002', 'ip': '192.168.1.20', 'last_seen': datetime.now().isoformat(), 'status': 'OK'},
    {'name': 'Router-Gateway', 'ip': '192.168.1.1', 'last_seen': datetime.now().isoformat(), 'status': 'OK'},
    {'name': 'Smart-Thermostat-003', 'ip': '192.168.1.30', 'last_seen': datetime.now().isoformat(), 'status': 'OK'},
    {'name': 'Motion-Sensor-004', 'ip': '192.168.1.40', 'last_seen': datetime.now().isoformat(), 'status': 'OK'},
]
quarantined_ips = set()
demo_mode = False

@app.route('/alert', methods=['POST'])
def receive_alert():
    """Accept alert JSON, validate fields, store in memory, return 200."""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.json
        
        if not data:
            return jsonify({'error': 'Empty request body'}), 400
        
        # Validate required fields
        required_fields = ['timestamp', 'src_ip', 'dst_ip']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400
        
        # Validate timestamp format
        try:
            datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return jsonify({'error': 'Invalid timestamp format. Use ISO 8601 format'}), 400
        
        # Normalize field names (support both 'anomaly_score' and 'score')
        score = data.get('anomaly_score') or data.get('score', 0.0)
        if not isinstance(score, (int, float)):
            try:
                score = float(score)
            except (ValueError, TypeError):
                score = 0.0
        
        alert = {
            'timestamp': data['timestamp'],
            'src_ip': str(data['src_ip']),
            'dst_ip': str(data['dst_ip']),
            'anomaly_score': float(score),
            'top_features': data.get('top_features', []),
            'device_name': data.get('device_name'),
        }
        
        # Store alert (keep last 200)
        alerts_store.append(alert)
        if len(alerts_store) > 200:
            alerts_store.pop(0)
        
        # Update device last_seen
        src_ip = alert['src_ip']
        device_found = False
        for device in devices_store:
            if device['ip'] == src_ip:
                device['last_seen'] = alert['timestamp']
                device_found = True
                break
        
        # If device not found, create new entry
        if not device_found:
            devices_store.append({
                'name': alert.get('device_name') or f'Device-{src_ip.split(".")[-1]}',
                'ip': src_ip,
                'last_seen': alert['timestamp'],
                'status': 'OK' if src_ip not in quarantined_ips else 'Quarantined'
            })
        
        return jsonify({'status': 'success', 'alert_id': len(alerts_store)}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error processing alert'}), 500

@app.route('/alerts', methods=['GET'])
def get_alerts():
    """Return last 200 alerts JSON (newest first)."""
    try:
        # Return newest first
        sorted_alerts = sorted(alerts_store, key=lambda x: x.get('timestamp', ''), reverse=True)
        return jsonify(sorted_alerts), 200
    except Exception as e:
        return jsonify({'error': 'Internal server error fetching alerts'}), 500

@app.route('/quarantine', methods=['POST'])
def quarantine_device():
    """Accept {"src": "<ip>"} and return simulated block confirmation."""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.json
        src_ip = data.get('src')
        
        if not src_ip:
            return jsonify({'error': 'Missing "src" field'}), 400
        
        src_ip = str(src_ip)
        
        # Add to quarantined set
        quarantined_ips.add(src_ip)
        
        # Update device status
        for device in devices_store:
            if device['ip'] == src_ip:
                device['status'] = 'Quarantined'
                break
        
        return jsonify({
            'status': 'success',
            'message': f'Device {src_ip} quarantined successfully',
            'action': 'blocked',
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error quarantining device'}), 500

@app.route('/unquarantine', methods=['POST'])
def unquarantine_device():
    """Accept {"src": "<ip>"} and unquarantine device."""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.json
        src_ip = str(data.get('src', ''))
        
        if not src_ip:
            return jsonify({'error': 'Missing "src" field'}), 400
        
        # Remove from quarantined set
        quarantined_ips.discard(src_ip)
        
        # Update device status
        for device in devices_store:
            if device['ip'] == src_ip:
                device['status'] = 'OK'
                break
        
        return jsonify({
            'status': 'success',
            'message': f'Device {src_ip} unquarantined',
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error unquarantining device'}), 500

@app.route('/run_attack', methods=['POST'])
def run_attack():
    """Trigger a simulated attack and return sample pcap path or status."""
    try:
        # Simulate generating an attack alert
        attack_ips = ['10.0.0.100', '172.16.0.50', '192.168.1.99', '203.0.113.42']
        src_ip = random.choice(attack_ips)
        dst_ip = random.choice([d['ip'] for d in devices_store if d['status'] == 'OK'])
        
        attack_types = [
            {
                'name': 'packet_rate',
                'value': round(random.uniform(800, 1500), 2),
                'baseline': 150.0
            },
            {
                'name': 'connection_duration',
                'value': round(random.uniform(0.01, 0.1), 3),
                'baseline': 2.5
            },
            {
                'name': 'bytes_sent',
                'value': random.randint(300000, 600000),
                'baseline': 8192
            }
        ]
        
        attack_alert = {
            'timestamp': datetime.now().isoformat(),
            'src_ip': src_ip,
            'dst_ip': dst_ip,
            'anomaly_score': round(random.uniform(0.75, 0.95), 3),
            'top_features': attack_types,
            'device_name': f'Attack-Source-{src_ip.split(".")[-1]}'
        }
        
        # Store the attack alert
        alerts_store.append(attack_alert)
        if len(alerts_store) > 200:
            alerts_store.pop(0)
        
        return jsonify({
            'status': 'success',
            'message': f'Attack simulation triggered from {src_ip}',
            'pcap_path': '/tmp/attack_simulation.pcap',
            'alert_generated': True,
            'attack_ip': src_ip
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error running attack simulation'}), 500

@app.route('/devices', methods=['GET'])
def get_devices():
    """Return device list with statuses."""
    try:
        # Update last_seen for demo devices if needed
        return jsonify(devices_store), 200
    except Exception as e:
        return jsonify({'error': 'Internal server error fetching devices'}), 500

@app.route('/start_demo', methods=['POST'])
def start_demo():
    """Start demo mode with periodic alerts."""
    global demo_mode
    demo_mode = True
    
    def generate_demo_alerts():
        while demo_mode:
            time.sleep(random.uniform(5, 15))
            if demo_mode:
                dst_ip = random.choice([d['ip'] for d in devices_store])
                src_ip = random.choice([d['ip'] for d in devices_store if d['ip'] != dst_ip])
                
                demo_alert = {
                    'timestamp': datetime.now().isoformat(),
                    'src_ip': src_ip,
                    'dst_ip': dst_ip,
                    'anomaly_score': round(random.uniform(0.3, 0.7), 3),
                    'top_features': [
                        {'name': 'packet_rate', 'value': round(random.uniform(100, 300), 2), 'baseline': 150.0},
                        {'name': 'connection_duration', 'value': round(random.uniform(1.0, 3.0), 2), 'baseline': 2.5}
                    ]
                }
                alerts_store.append(demo_alert)
                if len(alerts_store) > 200:
                    alerts_store.pop(0)
    
    thread = threading.Thread(target=generate_demo_alerts, daemon=True)
    thread.start()
    
    return jsonify({'status': 'success', 'message': 'Demo started'}), 200

@app.route('/stop_demo', methods=['POST'])
def stop_demo():
    """Stop demo mode."""
    global demo_mode
    demo_mode = False
    return jsonify({'status': 'success', 'message': 'Demo stopped'}), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'alerts_count': len(alerts_store),
        'devices_count': len(devices_store),
        'quarantined_count': len(quarantined_ips),
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get system statistics."""
    try:
        critical_alerts = sum(1 for a in alerts_store if (a.get('anomaly_score') or 0) > 0.8)
        high_alerts = sum(1 for a in alerts_store if 0.5 < (a.get('anomaly_score') or 0) <= 0.8)
        
        return jsonify({
            'total_alerts': len(alerts_store),
            'critical_alerts': critical_alerts,
            'high_alerts': high_alerts,
            'quarantined_devices': len(quarantined_ips),
            'total_devices': len(devices_store),
            'avg_threat_score': round(
                sum(a.get('anomaly_score', 0) for a in alerts_store) / len(alerts_store) if alerts_store else 0,
                3
            )
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat/session', methods=['POST'])
def create_chat_session():
    """Create a new chat session for an alert."""
    try:
        payload = request.get_json() or {}
        alert = payload.get('alert')
        alert_id = payload.get('alert_id') or (alert and alert.get('id'))
        if not alert and not alert_id:
            return jsonify({'error': 'alert or alert_id required'}), 400

        session_id = str(uuid.uuid4())
        message = initial_message_for_alert(alert or {'type': 'evil_twin', 'ssid': 'unknown'})
        session = {
            'session_id': session_id,
            'alert_id': alert_id,
            'history': [{'role': 'bot', 'msg': message}],
            'created': time.time()
        }
        CHAT_STORE.save_session(session_id, session)
        return jsonify({'session_id': session_id, 'message': message}), 200
    except Exception as exc:
        return jsonify({'error': 'Failed to create chat session', 'detail': str(exc)}), 500


@app.route('/api/chat/<session_id>/send', methods=['POST'])
def send_chat_message(session_id):
    """Send a user message inside an existing chat session."""
    try:
        payload = request.get_json() or {}
        text = (payload.get('text') or '').strip()
        if not text:
            return jsonify({'error': 'text required'}), 400

        session = CHAT_STORE.load_session(session_id)
        if not session:
            return jsonify({'error': 'session not found'}), 404

        bot_response = build_bot_response_text(text)
        timestamp = time.time()
        session['history'].append({'role': 'user', 'msg': text, 'ts': timestamp})
        session['history'].append({'role': 'bot', 'msg': bot_response, 'ts': timestamp})
        CHAT_STORE.save_session(session_id, session)
        return jsonify(bot_response)
    except Exception as exc:
        return jsonify({'error': 'Failed to send message', 'detail': str(exc)}), 500


@app.route('/api/chat/<session_id>/history', methods=['GET'])
def chat_history(session_id):
    """Return the stored messages for a session."""
    try:
        session = CHAT_STORE.load_session(session_id)
        if not session:
            return jsonify({'error': 'session not found'}), 404
        return jsonify(session.get('history', []))
    except Exception as exc:
        return jsonify({'error': 'Failed to load history', 'detail': str(exc)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=False, port=5000, host='0.0.0.0')

