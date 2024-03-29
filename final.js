var URL="http://localhost:8080/cse383_final/final.php";
var cartID;
var numCartItems = 0;
var tendered = 0;
$( document ).ready(function() {
	getCartID();
	filterByCategory();
	filterByPrice();
	showAll();

	$('#filterCategory').change(filterByCategory);
	$('#filterPrice').change(filterByPrice);
	$('#sort').change(function() {
        var selectedSort = $(this).val();
	        if (selectedSort === 'low') {
        		sortByLowPrice();
        	} else if (selectedSort === 'high') {
            		sortByHighPrice();
        	} else if (selectedSort === 'category') {
            		sortByCategory();
        	} else {
			showAll();
		}
    	});

});

function getCartID() {
	a=$.ajax({
		url: URL + '/createShoppingCart',
		method: "GET"
	}).done(function(data) {
		cartID = data.result[0].cartID;
		console.log("cart id: " + cartID);
	}).fail(function(error) {
		console.log("error", error.statusText);
	});
}

function showAll() {
        a=$.ajax({
                url: URL + '/getProduct?category=%&subcategory=%&id=0',
                method: "GET"
        }).done(function(data) {
                $("#items").html("");
                len = data.result.length;
                for (i = 0; i < len; i++) {
                        $("#items").append(`<div class="col-lg-3">
				<div class="card h-100" style="width: 100%;">
					<img src="${data.result[i].image}" style="height: 100px; width: 100px; margin-left: auto; margin-right: auto;" class="card-img-top" alt="${data.result[i].title}">
                                        <div class="card-body">
                                                <h5 class="card-title">${data.result[i].title}</h5>
                                                <p class="card-text">${data.result[i].description}</p>
						<p>$ ${data.result[i].price}</p>
						<div style="display: flex; justify-content: space-between; align-items: center;">
							<label for="quantity${data.result[i].productID}">QTY:</label>
                                    			<input type="number" id="quantity${data.result[i].productID}" name="quantity" value="1" min="1" style="width: 50px;">
                                                	<button type="button" class="btn btn-primary" onclick="addToCart(${data.result[i].productID}, document.getElementById('quantity${data.result[i].productID}').value)">Add to Cart</button>
                                        	</div>
					</div>
				</div>
			</div>`);
                }
		showCart();
        }).fail(function(error) {
                console.log("error", error.statusText);
        });

}

function showCart() {

	a=$.ajax({
		url: URL + '/getCartItems?cartID=' + cartID,
		method: "GET"
	}).done(function(data) {
		var total = 0;
		$("#modalBody").html("");
		len = data.cart.length;
		for (i = 0; i < len; i++) {
			var price = data.cart[i].price * data.cart[i].qty;
			total += price;
			$("#modalBody").append(`
			    <div style="display: flex; justify-content: space-between; align-items: center;">
        			<p>
            				<span style="margin-right: 10px;"><b>${data.cart[i].qty}</b></span>
            				<span style="margin-right: 10px;">${data.cart[i].title}:</span>
            				<span style="float: right;">$${price.toFixed(2)}</span>
        			</p>
        			<button data-productid="${data.cart[i].productID}" type="button" class="btn btn-primary" onclick="removeFromCart(${data.cart[i].productID}, ${data.cart[i].qty})">Remove</button>
    			    </div>
			    <br>
			`);
		}
		$("#modalBody").append(`<div style="display: flex; justify-content: space-between; align-items: center;">
				<p>Total:</p>
				<p>$${total.toFixed(2)}</p>
			</div>`);
		if (len == 0) {
			$("#modalBody").append("No items in cart");
		}
		tendered = total;
	}).fail(function(error) {
		console.log("error", error.statusText);
	});
}

function addToCart(productID, qty) {

        a=$.ajax({
                url: URL + '/addItemToCart?cartID=' + cartID + '&productID=' + productID + '&qty=' + qty,
                method: "GET"
        }).done(function(data) {
		showCart();
		numCartItems += parseInt(qty);
		$('#cart').html("");
		$("#cart").append(`<p>${numCartItems}</p>`);
        }).fail(function(error) {
                console.log("error", error.statusText);
        });
}

function removeFromCart(productID, qty) {

        a=$.ajax({
                url: URL + '/removeItemFromCart?cartID=' + cartID + '&productID=' + productID,
                method: "GET"
        }).done(function(data) {
		showCart();
		numCartItems -= parseInt(qty);
                $('#cart').html("");
                $("#cart").append(`<p>${numCartItems}</p>`);
        }).fail(function(error) {
                console.log("error", error.statusText);
        });
}

function filterByCategory() {
	var selectedCategory = $('#filterCategory').val();

	$.ajax({
		url: URL + '/getProduct?category=%&subcategory=' + encodeURIComponent(selectedCategory) + '&id=0',
		method: "GET"
	}).done(function (data) {
		if (selectedCategory === "none") {
			showAll();
		}
		$("#items").html("");
                len = data.result.length;
                for (i = 0; i < len; i++) {
                        $("#items").append(`<div class="col-lg-3">
                                <div class="card h-100" style="width: 18rem;">
                                        <img src="${data.result[i].image}" class="card-img-top" style="height: 100px; width: 100px; margin-left: auto; margin-right: auto;"  alt="${data.result[i].title}">
                                        <div class="card-body">
                                                <h5 class="card-title">${data.result[i].title}</h5>
                                                <p class="card-text">${data.result[i].description}</p>
                                                <p>$ ${data.result[i].price}</p>
                                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                                        <label for="quantity${data.result[i].productID}">QTY:</label>
                                                        <input type="number" id="quantity${data.result[i].productID}" name="quantity" value="1" min="1" style="width: 50px;">
                                                        <button type="button" class="btn btn-primary" onclick="addToCart(${data.result[i].productID}, document.getElementById('quantity${data.result[i].productID}').value)">Add to Cart</button>
                                                </div>
                                        </div>
                                </div>
                        </div>`);
                }

	}).fail(function (error) {
		console.log("error", error.statusText);
	});
}

function filterByPrice() {
	var selectedPrice = $('#filterPrice').val();

        $.ajax({
                url: URL + '/getProduct?category=%&subcategory=%&subcategory=%&id=0',
                method: "GET"
        }).done(function (data) {
		if (selectedPrice === "none") {
                        showAll();
                }
                $("#items").html("");
                len = data.result.length;
                for (i = 0; i < len; i++) {
			var itemPrice = parseFloat(data.result[i].price);

			if ((selectedPrice === "5" && itemPrice <= 5) ||
                	(selectedPrice === "10" && itemPrice > 5 && itemPrice <= 10) ||
                	(selectedPrice === "15" && itemPrice > 10 && itemPrice <= 15) ||
                	(selectedPrice === "up" && itemPrice > 15)) {
                        	$("#items").append(`<div class="col-lg-3">
                                	<div class="card h-100" style="width: 18rem;">
                                        	<img src="${data.result[i].image}" class="card-img-top"  style="height: 100px; width: 100px; margin-left: auto; margin-right: auto;" alt="${data.result[i].title}">
                                        	<div class="card-body">
                                                	<h5 class="card-title">${data.result[i].title}</h5>
                                                	<p class="card-text">${data.result[i].description}</p>
                                                	<p>$ ${data.result[i].price}</p>
                                                	<div style="display: flex; justify-content: space-between; align-items: center;">
                                                        	<label for="quantity${data.result[i].productID}">QTY:</label>
                                                        	<input type="number" id="quantity${data.result[i].productID}" name="quantity" value="1" min="1" style="width: 50px;">
                                                        	<button type="button" class="btn btn-primary" onclick="addToCart(${data.result[i].productID}, document.getElementById('quantity${data.result[i].productID}').value)">Add to Cart</button>
                                                	</div>
                                        	</div>
                                	</div>
                        	</div>`);
                	}
		}

        }).fail(function (error) {
                console.log("error", error.statusText);
        });
}

function sortByLowPrice() {

	a=$.ajax({
		url: URL + '/getProduct?category=%&subcategory=%&subcategory=%&id=0',
                method: "GET"
        }).done(function(data) {
		data.result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
		$("#items").html("");
                len = data.result.length;
                for (i = 0; i < len; i++) {
                        $("#items").append(`<div class="col-lg-3">
                                <div class="card h-100" style="width: 18rem;">
                                        <img src="${data.result[i].image}" style="height: 100px; width: 100px; margin-left: auto; margin-right: auto;"  class="card-img-top" alt="${data.result[i].title}">
                                        <div class="card-body">
                                                <h5 class="card-title">${data.result[i].title}</h5>
                                                <p class="card-text">${data.result[i].description}</p>
                                                <p>$ ${data.result[i].price}</p>
                                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                                        <label for="quantity${data.result[i].productID}">QTY:</label>
                                                        <input type="number" id="quantity${data.result[i].productID}" name="quantity" value="1" min="1" style="width: 50px;">
                                                        <button type="button" class="btn btn-primary" onclick="addToCart(${data.result[i].productID}, document.getElementById('quantity${data.result[i].productID}').value)">Add to Cart</button>
                                                </div>
                                        </div>
                                </div>
                        </div>`);
                }
        }).fail(function(error) {
                console.log("error", error.statusText);
        });
}

function sortByHighPrice() {

	a=$.ajax({
		url: URL + '/getProduct?category=%&subcategory=%&subcategory=%&id=0',
                method: "GET"
        }).done(function(data) {
		data.result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
		$("#items").html("");
                len = data.result.length;
                for (i = 0; i < len; i++) {
                        $("#items").append(`<div class="col-lg-3">
                                <div class="card h-100" style="width: 18rem;">
                                        <img src="${data.result[i].image}" class="card-img-top"  style="height: 100px; width: 100px; margin-left: auto; margin-right: auto;" alt="${data.result[i].title}">
                                        <div class="card-body">
                                                <h5 class="card-title">${data.result[i].title}</h5>
                                                <p class="card-text">${data.result[i].description}</p>
                                                <p>$ ${data.result[i].price}</p>
                                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                                        <label for="quantity${data.result[i].productID}">QTY:</label>
                                                        <input type="number" id="quantity${data.result[i].productID}" name="quantity" value="1" min="1" style="width: 50px;">
                                                        <button type="button" class="btn btn-primary" onclick="addToCart(${data.result[i].productID}, document.getElementById('quantity${data.result[i].productID}').value)">Add to Cart</button>
                                                </div>
                                        </div>
                                </div>
                        </div>`);
                }
        }).fail(function(error) {
                console.log("error", error.statusText);
        });
}

function sortByCategory() {

        a=$.ajax({
                url: URL + '/getProduct?category=%&subcategory=%&subcategory=%&id=0',
                method: "GET"
        }).done(function(data) {
		function sortByCategory(a, b) {
    		if (a.subcategory < b.subcategory) {
        		return -1;
    		}
    		if (a.subcategory > b.subcategory) {
        		return 1;
    		}
    		return 0;
		}
		data.result.sort(sortByCategory);
                $("#items").html("");
                len = data.result.length;
                for (i = 0; i < len; i++) {
                        $("#items").append(`<div class="col-lg-3">
                                <div class="card h-100" style="width: 18rem;">
                                        <img src="${data.result[i].image}" class="card-img-top"  style="height: 100px; width: 100px; margin-left: auto; margin-right: auto;" alt="${data.result[i].title}">
                                        <div class="card-body">
                                                <h5 class="card-title">${data.result[i].title}</h5>
                                                <p class="card-text">${data.result[i].description}</p>
                                                <p>$ ${data.result[i].price}</p>
                                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                                        <label for="quantity${data.result[i].productID}">QTY:</label>
                                                        <input type="number" id="quantity${data.result[i].productID}" name="quantity" value="1" min="1" style="width: 50px;">
                                                        <button type="button" class="btn btn-primary" onclick="addToCart(${data.result[i].productID}, document.getElementById('quantity${data.result[i].productID}').value)">Add to Cart</button>
                                                </div>
                                        </div>
                                </div>
                        </div>`);
                }
        }).fail(function(error) {
                console.log("error", error.statusText);
        });
}


function makeSale() {

	a=$.ajax({
		url: URL + '/makeSale?cartID=' + cartID,
		method: "GET"
	}).done(function(data) {
		console.log("sale success");
		$("#saleModalBody").html("");
		$("#saleModalBody").append(`<p>Amount tendered: $${tendered.toFixed(2)}</p>
			<label for="paymentMethod">Select Payment Method:</label>
                        <select name="paymentMethod" id="paymentMethod">
                                <option value="charge">Charge</option>
                                <option value="cash">Cash</option>
                        </select>
                `);

		$('#paymentMethod').change(function () {
            		var selectedPaymentMethod = $(this).val();

            		if (selectedPaymentMethod === 'charge') {
                		console.log('Charge selected');
            		} else if (selectedPaymentMethod === 'cash') {
                		console.log('Cash selected');
            			$("#saleModalBody").append(`<br>
		                        <label for="amount">Cash Amount: $</label>
                		        <input type="number" id="amount" name="amount">
                        		<br>
                        		<p id="changeLabel">Change:</p>
				`);
			}
			$('#amount').on('input', function () {
                        	var cashAmount = parseFloat($(this).val());
                        	if (!isNaN(cashAmount)) {
                                	var change = cashAmount - tendered;
                                	$('#changeLabel').text('Change: $' + change.toFixed(2));
                        	} else {
                                	$('#changeLabel').text('Change:');
                        	}
	                });

        	});
        }).fail(function(error) {
                console.log("error", error.statusText);
        });
}

function orderPrint() {

	a=$.ajax({
		url: URL + '/getClosedCartItems?cartID=' + cartID,
                method: "GET"
        }).done(function(data) {
		var total = 0;
		var newTab = window.open('orderPrint.html','_blank');
		newTab.onload = function() {
			var orderItemsElement = newTab.document.getElementById('orderItems');
			var orderTotalElement = newTab.document.getElementById('orderTotal');
			len = data.cart.length;
			for (i = 0; i < len; i++) {
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
	}).fail(function(error) {
		console.log("error", error.statusText);
	});
}

