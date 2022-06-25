const express = require("express");
const res = require("express/lib/response");
const { render } = require("express/lib/response");
const db = require("./db");
const util = require("./manage/util.js");
require("dotenv").config();

const app = express();
const port = 8080;
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");

global.g_email;
global.g_email = "1234@ntnu.com"; //g_ means global

//不同權限modify有問題

app.get("/", (req, res) => {
	res.render("index");
});
app.get("/index.pug", (req, res) => {
	res.redirect("/");
});

app.get("/register", (req, resp) => {
	resp.render("register");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.post("/login", async (req, resp) => {
	var postInfo = {
		email: req.body.email,
		password: req.body.password,
	};

	try {
		var sql = "select * from Person where email=?;";
		var Email = await db.query(sql, [postInfo.email]);
	} catch (error) {
		console.log(error);
	}

	if (Email.length === 0) {
		resp.render('login', {wrongInput: "Invalid Input!"});
	} else {
		try {
			var sql = "select password from Person where email=?;";
			var password = await db.query(sql, [postInfo.email]);
		} catch (error) {
			console.log(error);
		}
		password = Object.values(JSON.parse(JSON.stringify(password)));
		password = password[0].password;
		// console.log(password);

		if (password != postInfo.password) {
			resp.render('login', {wrongInput: "Invalid Input!"});
		} else {
			var sql = "select * from Person where email = ? and password = ?;";
			var loginState = await db.query(sql, [
				postInfo.email,
				postInfo.password,
			]);
			loginState = Object.values(JSON.parse(JSON.stringify(loginState)));
			var username = loginState[0].user_name;
			var email = loginState[0].email;
			var position = loginState[0].pos;
			if(position == 1)
			{
				resp.render("index2", { user: username });
				global.g_email = email;
			} 
			else if( position == 2)
			{
				resp.render("index3", { user: username });
				global.g_email = email;
			} 
			else
			{
				resp.render("index", { user: username });
				global.g_email = email;
			}
		}
	}
});

app.post("/checkFunction", async (req, resp) => {
	var state = req.body.selectFunc;
	if (state == "Search") {
		resp.render('search');
	} else if(state == "Modify") {
		resp.render('modify');
	} else if(state == "Change Status")
	{
		resp.render('status');
	}else if(state == "Root")
	{
		resp.render('root');
	}else if(state == "Log Out")
	{
		resp.render('index');
	}
	else {
		resp.render('create');
	}
});

app.get("/search", (req, res) => {
	res.render("search");
});

app.get("/modify", (req, resp) => {
	resp.render('modify');
});

app.get("/modify-action", (req, resp) => {
	resp.render('modify_action')
});

app.get("/create", (req, res) => {
	res.render('create');
});

app.get("/status", (req, res) => {
	res.render("status");
});

app.get("/root", (req, resp) => {
	resp.render('root');
});

app.post("/checkState", (req, res) => {
	var state = req.body.selectState;
	if (state == "Register") {
		res.render('register');
	} else {
		res.render('login');
	}
});

app.post("/register", async (req, resp) => {
	var postInfo = {
		name: req.body.name,
		password: req.body.password,
		phone: req.body.phone,
		email: req.body.email,
		address: req.body.address,
		privilege: req.body.p_code,
	};
	//check if email exist
	try {
		var sql = "select * from Person where email=?;";
		var RegEmail = await db.query(sql, [postInfo.email]);
	} catch (error) {
		console.log(error);
	}
	if (RegEmail.length > 0) {
		 resp.render("register", {
                	status: "Email Registered.",
        
        	});
	}
	else {
		// if p_code=1111 staff(pos=2) p_code=2222 root(pos=3)
		if (postInfo.privilege === "1111") {
			try {
				var sql =
					"insert into Person(user_name, phone, email, addr, password, pos) values(?,?,?,?,?,?);";
				var registerResult = await db.query(sql, [
					postInfo.name,
					postInfo.phone,
					postInfo.email,
					postInfo.address,
					postInfo.password,
					2,
				]);
				
			} catch (err) {
				console.log(err);
			}
		} else if (postInfo.privilege === "2222") {
			try {
				var sql =
					"insert into Person(user_name, phone, email, addr, password, pos) values(?,?,?,?,?,?);";
				var registerResult = await db.query(sql, [
					postInfo.name,
					postInfo.phone,
					postInfo.email,
					postInfo.address,
					postInfo.password,
					3,
				]);
				
			} catch (err) {
				console.log(err);
			}
		} else {
			try {
				var sql =
					"insert into Person(user_name, phone, email, addr, password) values(?,?,?,?,?);";
				var registerResult = await db.query(sql, [
					postInfo.name,
					postInfo.phone,
					postInfo.email,
					postInfo.address,
					postInfo.password,
				]);
			} catch (err) {
				console.log(err);
			}
		}
		resp.render("register", {
			status: "Registered Successfully!",
			email: postInfo.email,
		});
	}
});

app.post("/create", async (req, res) => {
	var recER = {
		name: req.body.receiver_name,
		email: req.body.receiver_email,
		phone: req.body.receiver_PN,
		county: req.body.receiver_selection,
		address: req.body.receiver_addr,
		PLZ: req.body.receiver_plz,
	};
	var product = {
		name: req.body.productName,
		price: req.body.price,
		fee: req.body.fee,
	};

	//insert receiver info into People
	try {
		var sql =
			"insert into Person(user_name, phone, email, addr, pos) values(?,?,?,?,?);";
		var newBuyer = await db.query(sql, [
			recER.name,
			recER.phone,
			recER.email,
			recER.address,
			recER.PLZ,
		]);
	} catch (error) {
		console.log(error);
	}

	//get sender info from People by email(get email when login)
	try {
		var sql = "select id from Person where email=?;";
		var senderId = await db.query(sql, [g_email]);
	} catch (error) {
		console.log(error);
	}
	senderId = Object.values(JSON.parse(JSON.stringify(senderId)));
	senderID = senderId[0].id;

	//get receiver id
	try {
		sql = "select id from Person where email = ?;";
		var ReceiverID = await db.query(sql, [recER.email]);
	} catch (error) {
		console.log(error);
	}

	ReceiverID = Object.values(JSON.parse(JSON.stringify(ReceiverID)));
	console.log(ReceiverID)
	ReceiverID = ReceiverID[0].id;

	// console.log("Receiver ID: " + receiverID + ", Sender ID: " + senderID);

	// insert content into product
	try {
		sql = "insert into Product(p_name, cost) values(?, ?);";
		var createProduct = await db.query(sql, [product.name, product.price]);
	} catch (err) {
		console.log(err);
	}

	//get product id
	try {
		sql = "select product_id from Product where p_name = ? and cost=?;";
		var getProductID = await db.query(sql, [product.name, product.price]);
	} catch (error) {
		console.log(error);
	}
	getProductID = Object.values(JSON.parse(JSON.stringify(getProductID)));
	var productID = getProductID[0].product_id;

	//create order id and timestamp
	try {
		sql = "insert into Orders() values ();";
		var createOrder = await db.query(sql, []);
	} catch (error) {
		console.log(error);
	}

	//get order id
	try {
		sql = "select order_id , time from Orders Order by time DESC;";
		var getOrderID = await db.query(sql, []);
	} catch (error) {
		console.log(error);
	}
	getOrderID = Object.values(JSON.parse(JSON.stringify(getOrderID)));
	var orderID = getOrderID[0].order_id;

	//insert into contain
	if (getOrderID != {} && getProductID != {}) {
		try {
			sql = "insert into Contain values(?, ?);";
			var createContain = await db.query(sql, [orderID, productID]);
		} catch (error) {
			console.log(error);
		}
	}

	// Trans and states
	try {
		sql = "insert into Trans (cur_state, addr) values(?, ?);";
		var orderIntoTrans = await db.query(sql, [0, recER.address]);
	} catch (err) {
		console.log(err);
	}

	//get trans_id
	try {
		sql = "select trans_id from Trans order by time DESC;";
		var getTransID = await db.query(sql, []);
	} catch (err) {
		console.log(err);
	}
	getTransID = Object.values(JSON.parse(JSON.stringify(getTransID)));
	var transID = getTransID[0].trans_id;

	//insert order id and trans id into states
	try {
		sql = "insert into States values(?, ?);";
		var insertStates = await db.query(sql, [orderID, transID]);
	} catch (err) {
		console.log(err);
	}

	// insert order id and receiver id into buy
	try {
		sql = "insert into Buy values(?, ?);";
		var insertBuy = await db.query(sql, [ReceiverID, orderID]);
	} catch (err) {
		console.log(err);
	}

	// insert order id and sender id into sell
	try {
		sql = "insert into Sell values(?,?);";
		var insertSell = await db.query(sql, [senderID, orderID]);
	} catch (err) {
		console.log(err);
	}

	res.render('create',{
		State: "Added new Product successfully.",
		order_ID: orderID,
	});
});

app.post("/search-action", async (req, resp) => {
	var id = req.body.search;
	try {
		/*增加 await */
		var trans_id = await db.query(
			"select trans_id from States where order_id=?;",
			[id]
		);
	} catch (err) {
		console.log(err);
	}

	if (trans_id.length === 0) {
		resp.render("search", { ID: id, status: "The Order Does Not Exist." });
	} else {
		trans_id = Object.values(JSON.parse(JSON.stringify(trans_id)));
		trans_id = trans_id[0].trans_id;

		try {
			/* add await */
			var result = await db.query(
				"select * from Trans where trans_id=?;",
				[trans_id]
			);

			if (result === {}) {
				resp.render("search", { status: "The Order Doesn't Exist." });
			} else {
				//result = JSON.stringify(result);
				// console.log(
				// 	result[0].trans_id + " " + typeof result[0].trans_id
				// );
				var t_id = result[0].trans_id;
				t_id = t_id.toString();
				// console.log(typeof t_id);
				if (result[0].cur_state === 0) {
					var status =
						// "Order ID: " +
						// t_id +
						// "\n" +
						"   Order Status: " + "Order Received\n";
				} else if (result[0].cur_state === 1) {
					var status =
						// "Order ID: " +
						// t_id +
						// "\n" +
						"   Order Status: " + "Package Delivering\n";
				} else if (result[0].cur_state === 2) {
					var status =
						// "Order ID: " +
						// t_id +
						// "\n" +
						"   Order Status: " + "Package Arrived\n";
				}
				resp.render("search", { ID: id, status: status });
			}
		} catch (err) {
			console.log(err);
		}
	}
});

app.post("/modify-search", async (req, resp) => {
	var _id = req.body._id;
	console.log(_id);

	try {
		var isExist = await db.query(
			"SELECT time FROM Orders WHERE order_id=?;",
			[_id]
		);
	} catch (err) {
		console.log(err);
	}

	if (isExist.length === 0) {
		resp.render('modify',{error: "The Order Does Not Exist."});
	} else {
		try {
			var seller_id = await db.query(
				"select id from Sell where order_id=?;",
				[_id]
			);
			// resp.send(seller_id);
		} catch (err) {
			console.log(err);
		}

		seller_id = Object.values(JSON.parse(JSON.stringify(seller_id)));
		seller_id = seller_id[0].id;
		console.log(seller_id);

		try {
			var seller_info = await db.query(
				"select user_name, phone, addr from Person where id=?;", //user__id
				[seller_id]
			);
			console.log(seller_info);
			// resp.send(seller_info);
		} catch (err) {
			console.log(err);
		}

		//get seller email
		try {
			var seller_email = await db.query(
				"select email from Person where id=?;", //user__id
				[seller_id]
			);
			console.log(seller_email);
			// resp.send(seller_info);
		} catch (err) {
			console.log(err);
		}
		var seller_email = Object.values(
			JSON.parse(JSON.stringify(seller_email))
		);
		seller_email = seller_email[0].email;

		//get user pos
		try {
			var user_pos = await db.query(
				"select pos from Person where email=?;", //user__id
				[g_email]
			);
			// console.log(seller_info);
			// resp.send(seller_info);
		} catch (err) {
			console.log(err);
		}
		user_pos = Object.values(JSON.parse(JSON.stringify(user_pos)));
		user_pos = user_pos[0].pos;

		// console.log(seller_email + "  " + g_email);
		console.log(user_pos);
		console.log(typeof user_pos);

		// check if the order belongs to the seller (root and staff can modify all orders)
		if (seller_email === g_email || user_pos === 2 || user_pos === 3) {
			try {
				var buyer_id = await db.query(
					"select id from Buy where order_id=?;",
					[_id]
				);
				//resp.send(result);
			} catch (err) {
				console.log(err);
			}
			buyer_id = Object.values(JSON.parse(JSON.stringify(buyer_id)));
			buyer_id = buyer_id[0].id;
			// console.log(buyer_id);
			try {
				var buyer_info = await db.query(
					"select user_name, phone, email, addr from Person where id=?;", //user__id
					[buyer_id]
				);
				// console.log(buyer_info);
				// resp.send(buyer_info);
			} catch (err) {
				console.log(err);
			}
			buyer_info = Object.values(JSON.parse(JSON.stringify(buyer_info)));
			buyer_info = buyer_info[0];
			seller_info = Object.values(JSON.parse(JSON.stringify(seller_info)));
			seller_info = seller_info[0];
			// console.log(buyer_info);
			// console.log(seller_info);
			// var info = {
			// 	Receiver: buyer_info,
			// 	Sender: seller_info,
			// };
			resp.render( 'modify', {buyer: buyer_info, seller: seller_info} );
		} else {
			resp.render('modify', {error: "No item found."});	
		}
	}
});

app.post("/modify-toAction", async (req, resp) => {
	var _id = req.body._id;
	resp.redirect('http://54.92.215.40:8080/modify-action');
});

//error
app.post("/modify-action", async (req, resp) => {
	var order_id = req.body._id;
	var selection = req.body.selection;
	var modifyData = req.body.modifyData;

	try {
		var isExist = await db.query(
			"SELECT time FROM Orders WHERE order_id=?;",
			[order_id]
		);
		// resp.send(isExist);
	} catch (err) {
		console.log(err);
	}
	if (isExist.length === 0) {
		resp.render('modify_action',{status: "The order does not exist"});
	}
	//
	else {
		//
		try {
			var seller_id = await db.query(
				"select id from Sell where order_id=?;",
				[order_id]
			);
			// resp.send(seller_id);
		} catch (err) {
			console.log(err);
		}
		seller_id = Object.values(JSON.parse(JSON.stringify(seller_id)));
		seller_id = seller_id[0].id;
		console.log(seller_id);

		try {
			var seller_info = await db.query(
				"select email, pos from Person where id=?;", //user__id
				[seller_id]
			);
			console.log(seller_info);
			// resp.send(seller_info);
		} catch (err) {
			console.log(err);
		}
		//get seller email
		var seller_email = Object.values(
			JSON.parse(JSON.stringify(seller_info))
		);
		seller_email = seller_email[0].email;

		//get user pos
		try {
			var user_pos = await db.query(
				"select pos from Person where email=?;", //user__id
				[g_email]
			);
			// console.log(user_pos);
			// resp.send(seller_info);
		} catch (err) {
			console.log(err);
		}
		var user_pos = Object.values(JSON.parse(JSON.stringify(user_pos)));
		user_pos = user_pos[0].pos;
		// console.log("user pos" + user_pos);
		// console.log(typeof user_pos);
		// console.log(seller_email + " " + g_email);

		//if the order doesn't exist or the order doesn't belongs to the user and he/she isn't a staff
		if (seller_email === g_email || user_pos === 2 || user_pos === 3) {
			var flag = 0;
			if (selection === "delete_order") {
				try {
					var result = await db.query(
						"DELETE FROM Orders WHERE order_id=?;",
						[order_id]
					);
					flag = 1;
					if (result["warningCount"] === 0) {
						resp.render('modify_action',{status: "Successfully Modified."});
					} else {
						resp.render('modify_action',{status: "Failed Modified."});
					}
					// resp.send(result);
				} catch (err) {
					console.log(err);
				}
			}

			if (!flag) {
				try {
					var seller_id = await db.query(
						"select id from Sell where order_id=?;",
						[order_id]
					);
				} catch (err) {
					console.log(err);
				}
				seller_id = Object.values(
					JSON.parse(JSON.stringify(seller_id))
				);
				seller_id = seller_id[0].id;
				console.log(seller_id);

				try {
					var buyer_id = await db.query(
						"select id from Buy where order_id=?;",
						[order_id]
					);
					//resp.send(result);
				} catch (err) {
					console.log(err);
				}
				console.log("B:" + buyer_id);
				buyer_id = Object.values(JSON.parse(JSON.stringify(buyer_id)));
				console.log("B:" + buyer_id);
				buyer_id = buyer_id[0].id;
				console.log("B:" + buyer_id);
			}

			if (selection === "sender_name") {
				try {
					var result = await db.query(
						"UPDATE Person SET user_name=? WHERE id=?;", //user__id
						[modifyData, seller_id]
					);

					if (result["warningCount"] === 0) {
						resp.render('modify_action',{status: "Successfully Modified."});
					} else {
						resp.render('modify_action',{status: "Fail Modified."});
					}
				} catch (err) {
					console.log(err);
				}
			} else if (selection === "sender_address") {
				try {
					var result = await db.query(
						"UPDATE Person SET addr=? WHERE id=?;", //user__id
						[modifyData, seller_id]
					);
					if (result["warningCount"] === 0) {
						resp.render('modify_action',{status: "Successfully Modified."});
					} else {
						resp.render('modify_action',{status: "Failed Modified."});
					}
					// resp.send(result);
				} catch (err) {
					console.log(err);
				}
			} else if (selection === "sender_phone") {
				try {
					var result = await db.query(
						"UPDATE Person SET phone=? WHERE id=?;", //user__id
						[modifyData, seller_id]
					);
					if (result["warningCount"] === 0) {
						resp.render('modify_action',{status: "Successfully Modified."});
					} else {
						resp.render('modify_action',{status: "Failed Modified."});
					}
					// resp.send(result);
				} catch (err) {
					console.log(err);
				}
			} else if (selection === "receiver_name") {
				try {
					var result = await db.query(
						"UPDATE Person SET user_name=? WHERE id=?;", //user__id
						[modifyData, buyer_id]
					);
					if (result["warningCount"] === 0) {
						resp.render('modify_action',{status: "Successfully Modified."});
					} else {
						resp.render('modify_action',{status: "Failed Modified."});
					}
					// resp.send(result);
				} catch (err) {
					console.log(err);
				}
			} else if (selection === "receiver_address") {
				try {
					var result = await db.query(
						"UPDATE Person SET addr=? WHERE id=?;", //user__id
						[modifyData, buyer_id]
					);
					if (result["warningCount"] === 0) {
						resp.render('modify_action',{status: "Successfully Modified."});
					} else {
						resp.render('modify_action',{status: "Failed Modified."});
					}
					// resp.send(result);
				} catch (err) {
					console.log(err);
				}
			} else if (selection === "receiver_phone") {
				try {
					var result = await db.query(
					
						"UPDATE Person SET phone=? WHERE id=?;", //user__id
						[modifyData, buyer_id]
					);
					if (result["warningCount"] === 0) {
						resp.render('modify_action',{status: "Successfully Modified."});
					} else {
						resp.render('modify_action',{status: "Failed Modified."});
					}
					// resp.send(result);
				} catch (err) {
					console.log(err);
				}
			} else if (selection === "receiver_email") {
				try {
					var result = await db.query(
						"UPDATE Person SET email=? WHERE id=?;", //user__id
						[modifyData, buyer_id]
					);
					if (result["warningCount"] === 0) {
						resp.render('modify_action',{status: "Successfully Modified."});
					} else {
						resp.render('modify_action',{status: "Failed Modified."});
					}
					// resp.send(result);
				} catch (err) {
					console.log(err);
				}
			}
		} else {
			resp.render('modify_action', {status: "You don't have the access to modify the order."});
		}
	}
});

app.post("/status-action", async (req, resp) => {
	var id = req.body.search;
	//cur_state 0=order received 1=delivering 2=arrived
	try {
		/*增加 await */
		var trans_id = await db.query(
			"select trans_id from States where order_id=?;",
			[id]
		);
	} catch (err) {
		console.log(err);
	}

	if (trans_id.length === 0) {
		resp.render("status", { status: "The Order Does Not Exist." });
		resp.end();
	} else {
		trans_id = Object.values(JSON.parse(JSON.stringify(trans_id)));
		trans_id = trans_id[0].trans_id;

		try {
			/* add await */
			var cur_state = await db.query(
				"select cur_state from Trans where trans_id=?;",
				[trans_id]
			);
			cur_state = Object.values(JSON.parse(JSON.stringify(cur_state)));
			cur_state = cur_state[0].cur_state;
			var flag = 0;
			if (cur_state === 0) {
				var curUpdate = 1;
				var sentence = "Status Updated: Order Receive ==> Delivering";
				flag = 1;
			} else if (cur_state === 1) {
				var curUpdate = 2;
				var sentence = "Status Updated: Delivering ==> Arrived";
				flag = 2;
			} else if (cur_state === 2) {
				var curUpdate = 2;
				var sentence =
					"The package has been delivered, you cannot update its status!";
				resp.render("status", { status: sentence });
			}
			if (flag) {
				try {
					var result = await db.query(
						"UPDATE Trans SET cur_state=? WHERE trans_id=?;",
						[curUpdate, trans_id]
					);
				} catch (err) {
					console.log(err);
				}
				resp.render("status", { status: sentence });
			}
		} catch (err) {
			console.log(err);
		}
	}
});

app.post("/root-action", async (req, resp) => {
	// 1: user 2: staff 3: root
	var id = req.body.search;
	var position = req.body.position;
	console.log(position);
	try {
		var result = await db.query("SELECT * FROM Person WHERE id=?;", [id]);
	} catch (err) {
		console.log(err);
	}
	if (result === {}) {
		resp.render('root',{status: "The User Doesn't Exist!"});
	}

	try {
		var result = await db.query("UPDATE Person SET pos=? WHERE id=?;", [
			position,
			id,
		]);
		resp.render('root',{status: "Updated Successful!"});
	} catch (err) {
		console.log(err);
	}
	var result = await db.query("select * from Person where id=?;", [id]);
	console.log(result);
});

app.listen(port, (req, res) => {
	console.log(`Port${port} is running.`);
});
