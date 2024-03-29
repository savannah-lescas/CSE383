var URL = "http://localhost:8080/cse383_final/final.php";
var allClosedCarts; // Store all closed carts
var filteredClosedCarts; // Store filtered closed carts

$(document).ready(function () {
    dateAndId();
    document.getElementById("from").addEventListener("change", filterByDate);
    document.getElementById("to").addEventListener("change", filterByDate);
});

function dateAndId() {
    $.ajax({
        url: URL + '/findClosedCarts',
        method: "GET"
    }).done(function (data) {
        allClosedCarts = data.result;
        renderClosedCarts(allClosedCarts); // Initial rendering
    }).fail(function (error) {
        console.log("error", error.statusText);
    });
}

function renderClosedCarts(carts) {
    $("#closedCarts").html("");
    var len = carts.length;
    for (var i = 0; i < len; i++) {
        $("#closedCarts").append(`
            <tr>
                <th scope="row">${carts[i].closedDateTime}</th>
                <td id="numItems_${i}"></td>
                <td id="cartTotal_${i}"></td>
                <td><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal" onclick="showCart(${carts[i].cartID})">Select</button></td>
                <td><button type="button" class="btn btn-primary" onclick="orderPrint(${carts[i].cartID})">Order Print</button></td>
            </tr>
        `);
        getClosedCartItems(carts[i].cartID, i);
    }
}

function orderPrint(cartID) {
    a = $.ajax({
        url: URL + '/getClosedCartItems?cartID=' + cartID,
        method: "GET"
    }).done(function (data) {
        var total = 0;
        var newTab = window.open('orderPrint.html', '_blank');
        newTab.onload = function () {
            var orderItemsElement = newTab.document.getElementById('orderItems');
            var orderTotalElement = newTab.document.getElementById('orderTotal');
            var len = data.cart.length;
            for (var i = 0; i < len; i++) {
                var price = data.cart[i].price * data.cart[i].qty;
                total += price;
                orderItemsElement.innerHTML += `
                    <tr>
                        <th scope="row">${data.cart[i].qty}</th>
                        <td>${data.cart[i].title}</td>
                        <td><img src="${data.cart[i].image}" alt="${data.cart[i].title}" style="height: 100px; width: 100px;"></td>
                        <td>$${price}</td>
                    </tr>
                `;
            }
	orderTotalElement.innerHTML += `$${total.toFixed(2)}`;
        };
    }).fail(function (error) {
        console.log("error", error.statusText);
    });
}

function showCart(cartID) {
    a = $.ajax({
        url: URL + '/getClosedCartItems?cartID=' + cartID,
        method: "GET"
    }).done(function (data) {
        var total = 0;
        $("#selectBody").html("");
        var len = data.cart.length;
        for (var i = 0; i < len; i++) {
            var price = data.cart[i].price * parseInt(data.cart[i].qty);
            total += price;
            $("#selectBody").append(`
		    <p>
        		<span style="margin-right: 10px;"><b>${data.cart[i].qty}</b></span>
        		<span style="margin-right: 10px;">${data.cart[i].title}</span>
        		<span style="float: right;">$${price.toFixed(2)}</span>
    		    </p>
	    `);

        }
        $("#selectBody").append(`<div style="display: flex; justify-content: space-between; align-items: center;">
            <p>Total:</p>
            <p>$${total.toFixed(2)}</p>
        </div>`);
    }).fail(function (error) {
        console.log("error", error.statusText);
    });
}

function getClosedCartItems(cartID, index) {
    var numItems = 0;
    var cartTotal = 0;
    console.log("in getClosedCartItems");
    $.ajax({
        url: URL + '/getClosedCartItems?cartID=' + cartID,
        method: "GET"
    }).done(function (innerData) {
        var innerLen = innerData.cart.length;
        for (var j = 0; j < innerLen; j++) {
            numItems += parseInt(innerData.cart[j].qty);
            var price = innerData.cart[j].price * parseInt(innerData.cart[j].qty);
            cartTotal += price;
        }
	$(`#numItems_${index}`).text(numItems);
        $(`#cartTotal_${index}`).text(`$${cartTotal.toFixed(2)}`);
    }).fail(function (error) {
        console.log("error", error.statusText);
    });
}

function filterByDate() {
try {
    console.log("filtering by dates...");
    var fromDateInput = document.getElementById("from").value;
    var toDateInput = document.getElementById("to").value;

    // Convert input date format to yyyy-mm-dd
    var fromDate = convertDateFormat(fromDateInput);
    var toDate = convertDateFormat(toDateInput);

    console.log("from date: ", fromDate);
    console.log("to date: ", toDate);

    if (fromDate && toDate) {
        // Filter closedDateTimes based on the date range
	filteredClosedCarts = allClosedCarts.filter(function (cart) {
	    return cart.closedDateTime >= fromDate && cart.closedDateTime <= toDate + 'T23:59:59'; // Include the whole day of the "to" date
	});

        // Render the filtered closed carts
        renderClosedCarts(filteredClosedCarts);
        console.log("Filtered Dates:", filteredClosedCarts);
    } else {
        // If either date is not selected, display all closedDateTimes
        renderClosedCarts(allClosedCarts);
        console.log("No Date Range Selected");
    }
} catch (error) {
    console.error("Error in filterByDate:", error);
}
}

function convertDateFormat(dateString) {
    var parts = dateString.split("-");
    // Check if there are three parts (year, month, day)
    if (parts.length === 3) {
        var year = parts[0];
        var month = parts[1];
        var day = parts[2];
        // Check if year, month, and day are defined
        if (year && month && day) {
            return year + "-" + month.padStart(2, '0') + "-" + day.padStart(2, '0');
        }
    }
    // Return an empty string or handle the error as appropriate for your application
    return "";
}
