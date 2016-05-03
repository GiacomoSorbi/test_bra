"use strict";

const express = require("express");
const app = express();
var cookieParser = require('cookie-parser')

const port = 3500;
const host = "0.0.0.0";

let sessionIdProvider = 0;
let cartIdProvider = Math.round((Math.random() * 0xFFFFFFF));

app.use(cookieParser());
app.use(express.static(__dirname + '/client'));

/**
 * Utility function that ensures a string is a string.
 */
function notNullString(s) {
    if (typeof s === "string")
        return s;
    if (s === null || s === undefined)
        return "";
    s = s.toString();
    return typeof s === "string" ? s : "";
}


/**
 * The global map of cart data.
 * The key is the secret cookie, the value is the cart data object.
 */
const cartDataBase = {};

/**
 * Sets the cookie in the client response.
 */
function setCookie(response) {
    var sessionId = "cart" + (++sessionIdProvider).toString(16) + "_" + Math.round((Math.random() * 0xFFFFFFF)).toString(16);
    response.cookie('cartSessionId', sessionId, { maxAge: 900000, httpOnly: true });
    return sessionId;
}

/**
 * Gets a session id or creates a new session id from a request.
 */
function getSessionId(request, response) {
    let sessionId = request.cookies.cartSessionId;
    if (!sessionId && response)
        sessionId = setCookie(response);
    return sessionId;
}

function getCartData(request, response) {
    const sessionId = getSessionId(request, response);
    let cartData = cartDataBase[sessionId];
    if (!cartData) {
        // Creates a new cart data.
        cartData = {

            // An unique id that identifies this cart. Is not the same as the session id.
            id: "cart" + (++cartIdProvider).toString(16),

            // The cart items. Each item contains a primary key (name and size) and a quantity (numeric) value.
            items: []
        };

        // Store in the global database.
        cartDataBase[sessionId] = cartData;
    }
    return cartData;
}


function updateCartItem(request, response) {
    const cartData = getCartData(request, response);

    let name = notNullString(request.params.name);
    let size = notNullString(request.params.size);
    let quantity = parseInt(notNullString(request.params.quantity));

    if (!size)
        size = "M";

    if (name && size && quantity && isFinite(quantity)) {
        let found = false;
        const items = cartData.items;
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            if (item.name === name && item.size === size) {
                found = true;
                item.quantity += quantity;
                if (!isFinite(item.quantity) || item.quantity <= 0) {
                    // Quantity negative or zero, delete the item.
                    items.splice(i, 1);
                }
                break;
            }
        }

        if (!found && quantity > 0) {
            cartData.items.push({
                name: name,
                size: size,
                quantity: quantity
            });
        }
    }

    return response.json(cartData);
}

function clearCart(request, response) {
    const sessionId = getSessionId(request);
    if (sessionId) {
        const cartData = cartDataBase[sessionId];
        if (cartData) {
            delete cartDataBase[sessionId];
            return response.json(cartData.items.length > 0);
        }
    }
    return response.json(false);
}

/**
 * Gets the cart data.
 */
app.get(['/api/cart'], (request, response) => {
    return response.json(getCartData(request, response));
});

/**
 * Deletes a cart. Returns true if cart was deleted, false if not.
 */
app.delete(['/api/cart'], clearCart);
app.get(['/api/delete/cart'], clearCart);

/**
 * Adds or removes a cart item.
 * To entirely remove an item, pass a very big negative number, like -10000.
 * Returns the full cart object.
 */
app.put(['/api/cart/:name/:size/:quantity'], updateCartItem);
app.get(['/api/put/cart/:name/:size/:quantity'], updateCartItem);

app.listen(port, host, function onStart(err) {
    if (err) {
        console.error("Error starting express", err);
    }

    console.info("==> Listening on port %s. Open up http://%s:%s/ in your browser.", port, host, port);
});
