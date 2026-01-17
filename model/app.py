from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

print("🔍 Loading YOLO...")
model = YOLO('best.pt')
print("✅ YOLO loaded!")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model": "loaded"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = request.files['image']
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img_np = np.array(img)
        
        print(f"🖼️ Image: {img_np.shape}")
        
        # TRY MULTIPLE CONFIDENCE LEVELS
        results = model(img_np, conf=0.001, verbose=True)
        
        predictions = []
        for r in results:
            if r.boxes is not None and len(r.boxes) > 0:
                print(f"📦 Found {len(r.boxes)} fruits!")
                for box in r.boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = model.names[cls]
                    
                    print(f"🍎 DETECTED: {class_name} (conf={conf:.3f})")
                    
                    # Crop fruit
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    crop = img_np[y1:y2, x1:x2]
                    
                    # ✅ QUALITY SCORING (Computer Vision)
                    quality_grade = calculate_quality(crop)
                    
                    # ✅ DYNAMIC PRICES
                    prices = get_prices(class_name.lower())
                    price = int(prices['min'] + (quality_grade/10)*(prices['max']-prices['min']))
                    
                    predictions.append({
                        # 'fruit': class_name,
                        'confidence': round(conf, 3),
                        'quality_grade': round(quality_grade, 1),
                        'price_range': f"₹{prices['min']}-₹{prices['max']}",
                        'recommended_price': f"₹{price}"
                    })
            else:
                print("⚠️ NO fruits detected - try different image")
        
        # Return top 3
        top_results = sorted(predictions, key=lambda x: x['confidence'], reverse=True)[:1]
        print(f"✅ Sending {len(top_results)} predictions")
        return jsonify(top_results)
        
    except Exception as e:
        print(f"💥 ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify([])
def calculate_quality(crop):
    """FIXED: Realistic 4.0-8.5 range"""
    try:
        gray = cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY)
        hsv = cv2.cvtColor(crop, cv2.COLOR_RGB2HSV)
        
        # 1. Color consistency (ripe = uniform)
        color_std = np.std(hsv[:,:,1])
        color_score = max(3.5, 8.0 - color_std/20)
        
        # 2. Sharpness (fresh = crisp)
        lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        sharpness = max(3.5, 5.0 + lap_var/30000)
        
        # 3. Brightness
        bright_score = max(3.5, min(8.0, np.mean(hsv[:,:,2])/28))
        
        # 4. Size (realistic)
        height = crop.shape[0]
        size_score = max(3.5, min(7.5, 15000/height))
        
        quality = (color_score + sharpness + bright_score + size_score) / 4
        return round(min(8.5, max(4.0, quality)), 1)
    except:
        return 6.5

def get_prices(fruit):
    """Nagpur market prices ₹/quintal"""
    prices = {
        'potato': {'min': 850, 'max': 1200},
        'potatoes': {'min': 850, 'max': 1200},
        'tomato': {'min': 25, 'max': 50},
        'tomatoes': {'min': 25, 'max': 50},
        'onion': {'min': 25, 'max': 50},
        'cucumber': {'min': 800, 'max': 1500},
        'orange': {'min': 25, 'max': 50},
        'apple': {'min': 8, 'max': 20},
        'banana': {'min': 25, 'max': 50}
    }
    return prices.get(fruit, {'min': 1000, 'max': 1200})

if __name__ == '__main__':
    print("🚀 Fruit API LIVE: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
