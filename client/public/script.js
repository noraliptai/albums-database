import { products } from '/data.js';

const trackComponent = (track) => `
  <div class="trackCard">
    <h3>${track.name}</h3>
    <h4>Performer: ${products.find(product => product.details.find(detail => detail.name === track.name)).vendor.name}</h>
    <h4>Album: ${products.find(product => product.details.find(detail => detail.name === track.name)).name}</h>
    <h5>Track ID: ${track.track_id}</h5>
    <p>Composer: ${track.composer}</p>
  </div>
`

const albumComponent = (product) => `
  <div class="albumCard">
    <h3>${product.name}</h3>
    <h4>Performer: ${product.vendor.name}</h4>
    <p>Price: $${product.price}</p>
  </div>
`

const vendorComponent = (vendor) => `
  <div class="vendorCard">
    <h2>${vendor.vendor}</h2>
    <button class="toggle">Show/hide albums</button>
    <div id="${vendor.vendor}" class="hidden">${vendor.albums.map(album => `
      <div class="album">
        <h3>${album.name}</h3>
        <h4>Price: $${album.price}</h4>
        <button id="${album.name}" class="btn">Add to favorites</button>
        <button class="toggle">Show/hide tracks</button>
        <div class="hidden">${album.details.map(track => `
          <div class="track">
            <h5>${track.name}</h5>
            <p>track ID: ${track.track_id}</p>
            <p>length: ${timeConverter(track.milliseconds)}</p>
            <button id="${track.name}" class="trkbtn">Add to favorites</button>
          </div>
        `).join("")}
        </div>
      </div>
    `).join("")}
    </div>
  </div>
`

const timeConverter = (milliseconds) => {
  let totalSeconds = Math.round(milliseconds / 1000)
  let hours = Math.floor(totalSeconds/60/60)
  let minutes = Math.floor((totalSeconds - hours*60*60) / 60)
  let seconds = totalSeconds - hours*60*60 - minutes*60

  const zeros = (number) => {
    if (number >= 10) return `${number}`
    else return `0${number}`
  }

  return `${zeros(hours)}:${zeros(minutes)}:${zeros(seconds)}`
}

let favorites = []

const loadEvent = function() {

  // Write your JavaScript code after this line
  //console.log(products[0]);

  // Create divs, fav and reset buttons

  const rootElement = document.getElementById("root")
  
  rootElement.insertAdjacentHTML("beforeend", `<div id="buttonsDiv"></div>`)
  rootElement.insertAdjacentHTML("beforeend", `<div id="titleDiv"></div>`)
  rootElement.insertAdjacentHTML("beforeend", `<div id="mainDiv"></div>`)

  const buttonsDiv = document.getElementById("buttonsDiv")
  const titleDiv = document.getElementById("titleDiv")
  const mainDiv = document.getElementById("mainDiv")

  buttonsDiv.insertAdjacentHTML("beforeend", `<button id="favAlbums">Favorite albums</button>`)
  buttonsDiv.insertAdjacentHTML("beforeend", `<button id="favTracks">Favorite tracks</button>`)
  buttonsDiv.insertAdjacentHTML("beforeend", `<button id="reset" class="hidden">Reset list</button>`)

  const favAlbumButton = document.getElementById("favAlbums")
  const favTrackButton = document.getElementById("favTracks")
  const resetButton = document.getElementById("reset")
  
  // Group products by vendor and list them

  const groupByVendor = (products) => {
    let albumsByVendor = [
      {
        vendor: products[0].vendor.name,
        albums: []
      }
    ]

    products.forEach(product => {
      for (let i = 0; i < albumsByVendor.length; i++) {
        if (albumsByVendor[i].vendor === product.vendor.name) {
          albumsByVendor[i].albums.push(product)
          break
        }
        if (i === albumsByVendor.length - 1) {
          albumsByVendor.push({
            vendor: product.vendor.name,
            albums: [product]
          })
          break
        }
      }
    })
    return albumsByVendor
  }

  const albumsByVendor = groupByVendor(products)

  const listProductsByVendor = (albumsByVendor) => {
    titleDiv.innerHTML = `<h3>Browse albums and choose favorites!</h3>`
    albumsByVendor.forEach(vendor => {
      mainDiv.insertAdjacentHTML("beforeend", vendorComponent(vendor))
    })
    
    // Eventlisteners for buttons add to /remove from favorites
    
    const buttons = document.querySelectorAll(".btn, .trkbtn")
  
    const plusButtonEvent = (button) => {
      let clickedProduct
      if (button.classList.contains("btn")) clickedProduct = products.find(product => product.name === button.id)
      else clickedProduct = products.find(product => product.details.find(track => track.name === button.id)).details.find(track => track.name === button.id)
  
      if (!favorites.includes(clickedProduct)) {
        favorites.push(clickedProduct)
        button.innerText = "Remove from favorites"
      } else {
        favorites.splice(favorites.findIndex(item => item.name === clickedProduct.name), 1)
        button.innerText = "Add to favorites"
      }
  
      console.log(favorites)
    }
  
    buttons.forEach(button => button.addEventListener("click", () => plusButtonEvent(button)))

    const toggleButtons = document.querySelectorAll(".toggle")

    toggleButtons.forEach(button => button.addEventListener("click", () => {
      const selectedItem = button.nextElementSibling
      selectedItem.classList.toggle("hidden")
      const type = button.innerText.substring(button.innerText.length - 6)
      if (selectedItem.classList.contains(type)) selectedItem.classList.remove(type)
      else selectedItem.classList.add(type)
    }))
  }

  listProductsByVendor(albumsByVendor)
  

  
  // Eventlisteners for fav and reset buttons

  const filterFavs = (typeID, element) => {
    mainDiv.innerHTML = `<div id="favListDiv"></div>`
    favorites.filter(item => item[typeID]).forEach(item => {
      document.getElementById("favListDiv").insertAdjacentHTML("beforeend", element(item))
    })
  }

  const favButtonEvent = (itemID, component, buttonToHide, buttonToShow, items) => {
    if (favorites.filter(item => item[itemID]).length !== 0) {
      filterFavs(itemID, component)
      buttonToHide.classList.add("hidden")
      buttonToShow.classList.remove("hidden")
      resetButton.classList.remove("hidden")
      titleDiv.innerHTML = `<h3>Favorite ${items}:</h3>`
    } else {
      titleDiv.innerHTML = `<h3>There are no ${items} added to favorites yet...</h3>`
    }
  }

  favAlbumButton.addEventListener("click", () => favButtonEvent("id", albumComponent, favAlbumButton, favTrackButton, "albums"))
  
  favTrackButton.addEventListener("click", () => favButtonEvent("track_id", trackComponent, favTrackButton, favAlbumButton, "tracks"))

  resetButton.addEventListener("click", () => {
    mainDiv.innerHTML = null
    listProductsByVendor(albumsByVendor)
    resetButton.classList.add("hidden")
    favAlbumButton.classList.remove("hidden")
    favTrackButton.classList.remove("hidden")
    favorites = []
    //const resetedButtons = document.querySelectorAll(".btn, .trkbtn")
    //resetedButtons.forEach(button => button.addEventListener("click", () => plusButtonEvent(button)))
  })

  // Write your JavaScript code before this line

}

window.addEventListener("load", loadEvent);
