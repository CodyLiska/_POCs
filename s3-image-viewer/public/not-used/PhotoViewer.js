// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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

//
// Functions
//

// List the photo albums that exist in the bucket.
function listAlbums() {
  s3.listObjects({ Delimiter: "/" }, function (err, data) {
    if (err) {
      return alert("There was an error listing your albums: " + err.message);
    } else {
      var albums = data.CommonPrefixes.map(function (commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace("/", ""));
        return getHtml([
          "<li>",
          '<button style="margin:5px;" onclick="viewAlbum(\'' +
            albumName +
            "')\">",
          albumName,
          "</button>",
          "</li>",
        ]);
      });
      var message = albums.length
        ? getHtml(["<p>Click on an album name to view it.</p>"])
        : "<p>You do not have any albums. Please Create album.";
      var htmlTemplate = [
        "<h2>Albums</h2>",
        message,
        "<ul>",
        getHtml(albums),
        "</ul>",
      ];
      document.getElementById("viewer").innerHTML = getHtml(htmlTemplate);
    }
  });
}

// Show the photos that exist in an album.
function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  s3.listObjects({ Prefix: albumPhotosKey }, function (err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    // 'this' references the AWS.Request instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + "/";

    var photos = data.Contents.map(function (photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        "<span>",
        "<div>",
        "<br/>",
        '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
        "</div>",
        "<div>",
        "<span>",
        photoKey.replace(albumPhotosKey, ""),
        "</span>",
        "</div>",
        "</span>",
      ]);
    });
    var message = photos.length
      ? "<p>The following photos are present.</p>"
      : "<p>There are no photos in this album.</p>";
    var htmlTemplate = [
      "<div>",
      '<button onclick="listAlbums()">',
      "Back To Albums",
      "</button>",
      "</div>",
      "<h2>",
      "Album: " + albumName,
      "</h2>",
      message,
      "<div>",
      getHtml(photos),
      "</div>",
      "<h2>",
      "End of Album: " + albumName,
      "</h2>",
      "<div>",
      '<button onclick="listAlbums()">',
      "Back To Albums",
      "</button>",
      "</div>",
    ];
    document.getElementById("viewer").innerHTML = getHtml(htmlTemplate);
    document
      .getElementsByTagName("img")[0]
      .setAttribute("style", "display:none;");
  });
}


// // V2 Methods
// async function loadAlbum(albumName) {
//   const res = await fetch(`/api/album/${albumName}`);
//   const imageKeys = await res.json();

//   const container = document.getElementById('album-images');
//   container.innerHTML = ''; // clear previous images

//   imageKeys.forEach(key => {
//     const [album, filename] = key.split('/');
//     const img = document.createElement('img');
//     img.src = `/image/${album}/${filename}`;
//     img.alt = filename;
//     img.style = 'width: 200px; margin: 10px;';
//     container.appendChild(img);
//   });
// }


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