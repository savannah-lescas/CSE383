<?php 
class final_rest
{



/**
 * @api  /api/v1/setTemp/
 * @apiName setTemp
 * @apiDescription Add remote temperature measurement
 *
 * @apiParam {string} location
 * @apiParam {String} sensor
 * @apiParam {double} value
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
	public static function getProduct ($category, $subcategory, $id)

	{
			try {
				$retData["result"] = GET_SQL("select * from product where category like ? and subcategory like ? and (productID = ? or ? = '0') order by description", $category,$subcategory,$id,$id);
				$retData["status"]=0;
				$retData["message"]="select from product: category '$category' and subcategory '$subcategory' and id '$id'  found";
			}
			catch  (Exception $e) {
				$retData["status"]=1;
				$retData["message"]=$e->getMessage();
			}

		return json_encode ($retData);
	}

	public static function createShoppingCart ()

	{
		try {
			EXEC_SQL("insert into shoppingCart (closedDateTime) values (null)");
			$retData["result"] = GET_SQL("select last_insert_rowid() as cartID");
		}
		catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"]=$e->getMessage();
		}
		return json_encode ($retData);
	}

	public static function addItemToCart ($cartID, $productID, $qty) {
		$CART=GET_SQL("select shoppingCart.cartID from shoppingCart where shoppingCart.cartID=? and shoppingCart.closedDateTime is null", $cartID);
		if (count($CART) > 0) {
			$ITEM=GET_SQL("select * from cartItems where cartID=? and productID=?", $cartID,$productID);
			if (count($ITEM) > 0) {
				EXEC_SQL("update cartItems set qty=? where cartID=? and productID=?", $qty, $cartID, $productID);
				$retData["found"]=0;
 				$retData["message"]="existing product $productID set to $qty";
			}
			else {
				EXEC_SQL("insert into cartItems (qty, cartID, productID) values (?,?,?)", $qty,$cartID,$productID);
				$retData["found"]=0;
				$retData["message"]="product $productID added to cart = $qty";
			}
		}
		else {
			$retData["found"]=1;
			$retData["message"]="Cart not found or not available";
		}
		return json_encode ($retData);
	}

	public static function removeItemFromCart ($cartID,$productID) {

		$found=GET_SQL("select shoppingCart.cartID from shoppingCart join cartItems using (cartID) where shoppingCart.cartID=? and productID=? and shoppingCart.closedDateTime is null", $cartID, $productID);
		if (count($found) > 0) {
			EXEC_SQL("delete from cartItems where cartID=? and productID=?",$cartID,$productID);
			$retData["found"]=0;
			$retData["message"]="Item successfully removed from cart";
		}
		else {
			$retData["found"]=1;
			$retData["message"]="Item removal unsuccessful";
		}
		return json_encode ($retData);
	}

	public static function getCartItems($cartID) {

		try {
			$retData["cart"]=GET_SQL("select * from shoppingCart join cartItems using (cartID) join product using (productID) where shoppingCart.cartID=? and shoppingCart.closedDateTime is null order by Category,Subcategory,Title", $cartID);
			$retData["found"]=0;
			$retData["message"]="returned all items in cart $cartID";
		}
		catch (Exception $e) {
                        $retData["found"] = 1;
                        $retData["message"]=$e->getMessage();
                }
                return json_encode ($retData);
	}

	public static function makeSale($cartID) {

		try {
			$CART=GET_SQL("select shoppingCart.cartID from shoppingCart where shoppingCart.cartID=? and shoppingCart.closedDateTime is null",$cartID);
			if (count($CART) > 0) {
				EXEC_SQL("update shoppingCart set closedDateTime=CURRENT_TIMESTAMP where cartID=?",$cartID);
				$retData["found"]=0;
				$retData["message"]="closed cart $cartID";
			}
			else {
				$retData["found"]=1;
				$retData["message"]="cart not found or not available";
			}
		}
		catch (Exception $e) {
			$retData["found"]=1;
			$retData["message"]=$e->getMessage();
		}
		return json_encode ($retData);
	}

	public static function findClosedCarts() {

		try {
			$retData["result"]=GET_SQL("select * from shoppingCart where closedDateTime is not null order by closedDateTime desc");
		}
		catch (Exception $e) {
                        $retData["found"] = 1;
                        $retData["message"]=$e->getMessage();
                }
                return json_encode ($retData);
	}

public static function getClosedCartItems($cartID) {

                try {
                        $retData["cart"]=GET_SQL("select * from shoppingCart join cartItems using (cartID) join product using (productID) where shoppingCart.cartID=? order by Category,Subcategory,Title", $cartID);
                        $retData["found"]=0;
                        $retData["message"]="returned all items in cart $cartID";
                }
                catch (Exception $e) {
                        $retData["found"] = 1;
                        $retData["message"]=$e->getMessage();
                }
                return json_encode ($retData);
        }


} // end of final.class.php
