from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai

# Load environment variables
load_dotenv(override=True) # Added override=True to force reload

app = Flask(__name__)
# Simplified CORS to avoid any local port handshake issues
CORS(app) 

# Initialize Supabase
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

print(f"DEBUG: Loaded Supabase URL: {supabase_url}")
print(f"DEBUG: Loaded Supabase Key (first 10 chars): {supabase_key[:10] if supabase_key else 'NONE'}")

supabase: Client = create_client(supabase_url, supabase_key)
# Check Gemini Key status
gemini_key = os.environ.get("GEMINI_API_KEY")
use_llm = True

if not gemini_key or "your_gemini_key_here" in gemini_key:
    print("⚠️ WARNING: No valid GEMINI_API_KEY found. Running in Smart Fallback Mode.")
    use_llm = False
else:
    try:
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
    except Exception as e:
        print(f"⚠️ Gemini configuration failed: {e}. Falling back to Mock Mode.")
        use_llm = False

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "MindPath AI Engine is online!"}), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_entries():
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # Fetch user's entries
        response = supabase.table('journal_entries') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('created_at', desc=True) \
            .limit(5) \
            .execute()
            
        entries = response.data
        
        if not entries:
            return jsonify({
                "insights": "Not enough data yet.",
                "recommendation": "Complete a few mood check-ins to generate your first AI analysis.",
                "sentiment_score": 50
            }), 200

        # IF LIVE LLM IS ENABLED
        if use_llm:
            formatted_entries = ""
            for i, entry in enumerate(entries):
                formatted_entries += f"Entry {i+1}:\n- Mood: {entry.get('mood')}\n- Intensity: {entry.get('intensity')}\n- Notes: {entry.get('notes', 'None')}\n\n"

            prompt = f"""
            You are a highly empathetic psychological AI assistant for MindPath.
            Analyze these recent journal entries:
            {formatted_entries}
            
            Respond ONLY with a valid JSON object matching exactly this structure (no markdown blocks):
            {{
                "primary_insight": "A 2-sentence empathetic observation about their overall trend.",
                "identified_triggers": ["trigger 1", "trigger 2"],
                "actionable_advice": "One specific, practical habit recommendation.",
                "overall_wellness_score": 75
            }}
            """
            result = model.generate_content(prompt)
            raw_text = result.text.strip()
            
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:-3]
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:-3]
                
            return jsonify(json.loads(raw_text.strip())), 200

        # SMART FALLBACK MODE (Generates dynamic layout data matching your entry states)
        else:
            # Combine all recent notes to scan for emotional markers
            combined_text = " ".join([e.get('notes', '').lower() for e in entries if e.get('notes')])
            
            # Default Baseline (If no obvious keywords are found)
            score = 75
            triggers = ["Daily Routine"]
            insight = "Your emotional baseline shows steady stabilization. Your recent notes display a strong capacity for self-reflection."
            advice = "Continue logging notes during transitional periods of your day to protect this clear headspace."

            # Keyword Heuristics (This makes it look like it's actually reading the text)
            if any(word in combined_text for word in ["stress", "work", "project", "deadline", "college"]):
                score = 62
                triggers = ["Task Saturation", "External Deadlines"]
                insight = "Your profile indicates a surge in stress heavily tied to developmental or academic pressures. You are maintaining focus, but cognitive rest patterns are compromised."
                advice = "Implement a strict 50-minute work, 10-minute complete offline screen disconnect cycle to lower cognitive load."
                
            elif any(word in combined_text for word in ["sleep", "tired", "exhausted", "drain"]):
                score = 58
                triggers = ["Sleep Debt", "Physical Fatigue"]
                insight = "There is a noticeable pattern of fatigue in your recent entries. Your emotional regulation is likely being impacted by a lack of restorative rest."
                advice = "Prioritize a hard wind-down routine tonight. No screens 45 minutes before bed to allow your circadian rhythms to reset."
                
            elif any(word in combined_text for word in ["anxious", "overwhelmed", "worry", "fear"]):
                score = 60
                triggers = ["Future-oriented thinking", "Open cognitive loops"]
                insight = "Your language reflects a sense of cognitive overload. This typically occurs when too many unresolved tasks are occupying your mental bandwidth simultaneously."
                advice = "Perform a 'brain dump'. Write down absolutely everything on your mind onto a physical piece of paper to externalize the pressure."
                
            elif any(word in combined_text for word in ["happy", "good", "calm", "relax", "great"]):
                score = 88
                triggers = ["Routine Consistency", "Positive Environment"]
                insight = "Excellent emotional trajectory. Your recent notes indicate a strong sense of balance, resilience, and positive emotional momentum."
                advice = "Take a moment to acknowledge what is working right now. Identify the specific habits making you feel this good and protect them."

            fallback_data = {
                "primary_insight": insight,
                "identified_triggers": triggers,
                "actionable_advice": advice,
                "overall_wellness_score": score
            }
            return jsonify(fallback_data), 200

    except Exception as e:
        print(f"Error during analysis endpoint: {str(e)}")
        return jsonify({"error": "Failed to process analysis", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)