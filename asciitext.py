from PIL import Image, ImageEnhance
import numpy as np

# Load the image with transparency
image_path = r"C:\Users\anush\OneDrive\Documents\PSU\Personal Website\assets\profile-pic-removebg-preview.png"  # Replace with your file path
img = Image.open(image_path).convert("RGBA")  # Open as RGBA to handle transparency

# Remove the transparent background by converting it to white
background = Image.new("RGBA", img.size, (255, 255, 255, 255))  # White background
img = Image.alpha_composite(background, img).convert("L")  # Composite and convert to grayscale

# Save the grayscale image for debugging
img.save("grayscale_debug_image.png")

# Enhance the contrast and brightness
contrast_enhancer = ImageEnhance.Contrast(img)
img = contrast_enhancer.enhance(1.05)  # Increase contrast
brightness_enhancer = ImageEnhance.Brightness(img)
img = brightness_enhancer.enhance(2.3)  # Slightly increase brightness

# Show the enhanced image
img.show()  # Displays the enhanced grayscale image

# Crop the image to focus on the face (optional)
left, top, right, bottom = 50, 180, 400, 500  # Adjust based on the image
img = img.crop((left, top, right, bottom))

# Resize for ASCII art
width, height = img.size
aspect_ratio = height / width
new_width = 100  # Increase width for better detail
new_height = int(aspect_ratio * new_width * 0.55)  # Maintain aspect ratio
img = img.resize((new_width, new_height))

# Define ASCII characters based on brightness
chars = np.array(["@", "#", "S", "%", "?", "*", "+", ";", ":", ".", "<", ">", " "])  # Finer density range
pixels = np.array(img)
indices = (pixels / 255 * (len(chars) - 1)).astype(int)
ascii_art = "\n".join(["".join(row) for row in chars[indices]])

# Save ASCII art to a file and print it
with open("ascii_art_refined.txt", "w") as f:
    f.write(ascii_art)

print(ascii_art)
