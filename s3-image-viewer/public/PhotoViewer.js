var albumBucketName = "test.poc.new";

// Initialize the Amazon Cognito credentials provider
AWS.config.region = "us-west-1"; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "us-west-1:1ac83cf3-3726-4b87-be76-7ef5e9439a7c",
});

// Create a new service object
var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName },
});

// A utility function to create HTML.
function getHtml(template) {
  return template.join("\n");
}


// V2 Dynamic Names
async function loadAlbums() {
  try {
    console.log('Requesting /api/albums...');
    const res = await fetch('/api/albums');
    console.log('Response status:', res.status);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const albums = await res.json();
    console.log('Albums:', albums);

    const buttonContainer = document.getElementById('album-buttons');
    buttonContainer.innerHTML = '';

    albums.forEach(album => {
      const btn = document.createElement('button');
      btn.innerText = album;
      btn.onclick = () => loadAlbum(album);
      buttonContainer.appendChild(btn);
    });
  } catch (err) {
    console.error('Error loading albums:', err);
  }
}

async function loadAlbum(albumName) {
  const res = await fetch(`/api/album/${albumName}`);
  const imageKeys = await res.json();

  const container = document.getElementById('album-images');
  container.innerHTML = '';

  imageKeys.forEach(key => {
    const filename = key.split('/')[1]; // albumName/filename
    const img = document.createElement('img');
    img.src = `/image/${albumName}/${filename}`;
    img.alt = filename;
    img.style = 'width: 200px; margin: 10px;';
    container.appendChild(img);
  });
}

// Load albums on page load
loadAlbums();