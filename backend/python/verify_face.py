#!/usr/bin/env python
import os
import sys

# Set environment variables để tránh lỗi random initialization
os.environ['PYTHONHASHSEED'] = '0'

import face_recognition
import numpy as np

def verify_faces(image1_path, image2_path, threshold=0.5):
    """
    Compare two face images and return similarity score
    Returns: float (0.0 to 1.0)
    """
    try:
        # Load images
        img1 = face_recognition.load_image_file(image1_path)
        img2 = face_recognition.load_image_file(image2_path)
        
        # Get face encodings
        encodings1 = face_recognition.face_encodings(img1)
        encodings2 = face_recognition.face_encodings(img2)
        
        # If no face detected in either image
        if len(encodings1) == 0 or len(encodings2) == 0:
            print("0.0")
            return
        
        # Calculate face distance
        distance = face_recognition.face_distance([encodings1[0]], encodings2[0])[0]
        similarity = 1 - distance
        
        # Ensure similarity is between 0 and 1
        similarity = max(0.0, min(1.0, similarity))
        
        # Output only the similarity number
        print(f"{similarity:.6f}")
        
    except Exception as e:
        # On error, output 0.0
        print("0.0")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("0.0")
        sys.exit(1)
    
    img1_path = sys.argv[1]
    img2_path = sys.argv[2]
    threshold = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
    
    verify_faces(img1_path, img2_path, threshold)