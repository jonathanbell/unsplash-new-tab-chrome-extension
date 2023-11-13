function shuffleArr(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

document.addEventListener("DOMContentLoaded", () => {
  const imageContainer = document.getElementById("example-image");

  const appendNewImage = () => {
    const exampleImg = document.querySelector("#example-image img");
    if (exampleImg) {
      document.querySelector("#example-image img").remove();
      document.querySelector("#example-image p").style.display = "block";
    }

    const topics = [
      "nature",
      "water",
      "mountain",
      "forest",
      "ocean",
      "beach",
      "city",
      "road",
      "sky",
      "cloud",
      "tree",
      "flower",
      "animal",
      "food",
      "coffee",
      "drink",
      "building",
      "architecture",
      "apartment",
      "music",
      "concert",
      "festival",
      "couple",
      "book",
      "magazine",
      "newspaper",
      "lake",
      "river",
      "ocean",
      "sea",
      "cloud",
      "sun",
      "moon",
      "star",
      "space",
      "universe",
      "galaxy",
    ];

    imageContainer.style.cursor = "pointer";
    const newImage = document.createElement("img");
    shuffleArr(topics);
    newImage.src = `https://source.unsplash.com/random/900x600?${topics.join(
      ","
    )}`;
    newImage.style.maxWidth = "100%";
    newImage.style.borderRadius = "1rem";
    newImage.onload = function () {
      document.querySelector("#example-image p").style.display = "none";
      this.style.opacity = "1";
    };
    newImage.title = "A random image from Unsplash 📷";
    document.getElementById("example-image").appendChild(newImage);
  };

  appendNewImage();

  imageContainer.addEventListener("click", appendNewImage);
});
