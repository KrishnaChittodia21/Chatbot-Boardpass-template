'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const Client = require('node-rest-client').Client;
const app = express()
const client = new Client();



app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())

// Index route
app.get('', function(req, res){
	res.sendfile('./public/index.html');
})

// for Facebook verification
app.get('/Tryme Scheduler/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === '12345') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})
app.get('/Tryme Scheduler/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === '12345') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

//facebook token
const tokens = {

	"Tryme Scheduler":"EAAYgj0kGUAEBAHYNCsTGfGANhKUbhbIZCLx5O7tcViRMznoLcuzZCk5n96CwynG83Qhs77bTjr2UGGfPSXHlAEApcjuvYaTZCdl6QDdUxaZAC1P6MJYCDMIcVxMK9HZCqokSTWTg40pKwnhryAekQDrDJyz0grTpFwuzwZBEFyPwZDZD"
}

//webhook
app.post('/Tryme Scheduler/webhook/', function (req, res) {
	let token = tokens.TrymeScheduler
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text.toLowerCase()
			if (text == "itinerary") {
				sendItineraryMessage(sender, token)
			} else if (text === "checkin reminder") {
				sendCheckinReminderMessage(sender, token)
			} else if (text === "boarding pass") {
				sendBoardingPassMessage(sender, token)
			} else if (text === "flight update") {
				sendFlightUpdateMessage(sender, token)
			} else if (text === "get templates") {
				sendTemplateMessage(sender, token)
			} else {
				sendTemplateMessage(sender, token)
			}
		} else if (event.postback && event.postback.payload) {
			let text = event.postback.payload

		}
	}
	res.sendStatus(200)
})

// First Time User
getStarted()
function getStarted() {
	let token = tokens.TrymeScheduler
	request.post({
		method: 'POST',
		uri: 'https://graph.facebook.com/v2.8/me/thread_settings?access_token=' + token,
		qs: {
			setting_type: 'call_to_actions',
			thread_state: 'new_thread',
			call_to_actions: [{
                payload: 'GET_STARTED'
            }]
        },
		json: true
	}, (err, res, body) => {
		console.log(err)
	});
}

// Send Message
function sendMessage(sender, message, token) {
	request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: { id:sender },
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

// Send Welcome Message
function sendWelcomeMessage(sender, token) {
	let text = "Welcome to Top News"
	let message = {
		"attachment": {
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":text,
				"buttons":[{
					"type":"postback",
					"title":"LET'S BEGIN",
					"payload":"category"
				}]
			}
		}
	}
	sendMessage(sender, message, token)
}


// Send Itinerary Message
function sendItineraryMessage(sender, token) {
	let intro_message = "Here's your flight itinerary."
	let message = {
		"attachment": {
			"type": "template",
			"payload": {
			"template_type": "airline_itinerary",
			"intro_message": intro_message,
			"locale": "en_US",
			"pnr_number": "ABCDEF",
			"passenger_info": [{
				"name": "Farbound Smith Jr",
				"ticket_number": "0741234567890",
				"passenger_id": "p001"
			}, {
				"name": "Nick Jones",
				"ticket_number": "0741234567891",
				"passenger_id": "p002"
			}],
			"flight_info": [{
				"connection_id": "c001",
				"segment_id": "s001",
				"flight_number": "KL9123",
				"aircraft_type": "Boeing 737",
				"departure_airport": {
					"airport_code": "SFO",
					"city": "San Francisco",
					"terminal": "T4",
					"gate": "G8"
				},
				"arrival_airport": {
					"airport_code": "SLC",
					"city": "Salt Lake City",
					"terminal": "T4",
					"gate": "G8"
				},
				"flight_schedule": {
					"departure_time": "2016-01-02T19:45",
					"arrival_time": "2016-01-02T21:20"
				},
				"travel_class": "business"
			}, {
				"connection_id": "c002",
				"segment_id": "s002",
				"flight_number": "KL321",
				"aircraft_type": "Boeing 747-200",
				"travel_class": "business",
				"departure_airport": {
					"airport_code": "SLC",
					"city": "Salt Lake City",
					"terminal": "T1",
					"gate": "G33"
				},
				"arrival_airport": {
					"airport_code": "AMS",
					"city": "Amsterdam",
					"terminal": "T1",
					"gate": "G33"
				},
				"flight_schedule": {
					"departure_time": "2016-01-02T22:45",
					"arrival_time": "2016-01-03T17:20"
				}
			}],
			"passenger_segment_info": [{
					"segment_id": "s001",
					"passenger_id": "p001",
					"seat": "12A",
					"seat_type": "Business"
				}, {
					"segment_id": "s001",
					"passenger_id": "p002",
					"seat": "12B",
					"seat_type": "Business"
				}, {
					"segment_id": "s002",
					"passenger_id": "p001",
					"seat": "73A",
					"seat_type": "World Business",
					"product_info": [{
						"title": "Lounge",
						"value": "Complimentary lounge access"
					}, {
						"title": "Baggage",
						"value": "1 extra bag 50lbs"
					}]
				}, {
					"segment_id": "s002",
					"passenger_id": "p002",
					"seat": "73B",
					"seat_type": "World Business",
					"product_info": [{
						"title": "Lounge",
						"value": "Complimentary lounge access"
					}, {
						"title": "Baggage",
						"value": "1 extra bag 50lbs"
					}]
				}],
    		    "price_info": [{
					"title": "Fuel surcharge",
					"amount": "1597",
					"currency": "USD"
				}],
				"base_price": "12206",
				"tax": "200",
				"total_price": "14003",
				"currency": "USD"
			}
		}
	}
	sendMessage(sender, message, token)
}

// Send Checkin Reminder Message
function sendCheckinReminderMessage(sender, token) {
	let intro_message = "Check-in is available now."
	let message = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "airline_checkin",
				"intro_message": intro_message,
				"locale": "en_US",
				"pnr_number": "ABCDEF",
				"flight_info": [{
					"flight_number": "f001",
					"departure_airport": {
						"airport_code": "SFO",
						"city": "San Francisco",
						"terminal": "T4",
						"gate": "G8"
					},
					"arrival_airport": {
						"airport_code": "SEA",
						"city": "Seattle",
						"terminal": "T4",
						"gate": "G8"
					},
					"flight_schedule": {
						"boarding_time": "2016-01-05T15:05",
						"departure_time": "2016-01-05T15:45",
						"arrival_time": "2016-01-05T17:30"
					}
				}],
				"checkin_url": "https://enigmatic-atoll-16095.herokuapp.com/Tryme Scheduler/checkin.html"
			}
		}
	}
	sendMessage(sender, message, token)
}

// Send Boarding Pass Message
function sendBoardingPassMessage(sender, token) {
	let intro_message = "You are checked in."
	var root_url = "https://enigmatic-atoll-16095.herokuapp.com/Tryme Scheduler/img/"
	let logo_image_url = root_url + "logo.png"
	let header_image_url = root_url + "header.png"
	let above_bar_code_image_url = root_url + "bar_code.png"
	let message = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "airline_boardingpass",
				"intro_message": intro_message,
				"locale": "en_US",
				"boarding_pass": [{
					"passenger_name": "SMITH NICOLAS",
					"pnr_number": "CG4X7U",
					"travel_class": "business",
					"seat": "74J",
					"auxiliary_fields": [{
						"label": "Terminal",
						"value": "T1"
					}, {
						"label": "Departure",
						"value": "30OCT 19:05"
					}],
					"secondary_fields": [{
						"label": "Boarding",
						"value": "18:30"
					}, {
						"label": "Gate",
						"value": "D57"
					}, {
						"label": "Seat",
						"value": "74J"
					}, {
						"label": "Sec.Nr.",
						"value": "003"
					}],
					"logo_image_url": logo_image_url,
					"header_image_url": header_image_url,
					"qr_code": "M1SMITH NICOLAS  CG4X7U nawouehgawgnapwi3jfa0wfh",
					"above_bar_code_image_url": above_bar_code_image_url,
					"flight_info": {
						"flight_number": "KL0642",
						"departure_airport": {
							"airport_code": "JFK",
							"city": "New York",
							"terminal": "T1",
							"gate": "D57"
						},
						"arrival_airport": {
							"airport_code": "AMS",
							"city": "Amsterdam"
						},
						"flight_schedule": {
							"departure_time": "2016-01-02T19:05",
							"arrival_time": "2016-01-05T17:30"
						}
					}
				}, {
					"passenger_name": "JONES FARBOUND",
					"pnr_number": "CG4X7U",
					"travel_class": "business",
					"seat": "74K",
					"auxiliary_fields": [{
						"label": "Terminal",
						"value": "T1"
					}, {
						"label": "Departure",
						"value": "30OCT 19:05"
					}],
					"secondary_fields": [{
						"label": "Boarding",
						"value": "18:30"
					}, {
						"label": "Gate",
						"value": "D57"
					}, {
						"label": "Seat",
						"value": "74K"
					}, {
						"label": "Sec.Nr.",
						"value": "004"
					}],
					"logo_image_url": logo_image_url,
					"header_image_url": header_image_url,
					"qr_code": "M1SMITH NICOLAS  CG4X7U nawouehgawgnapwi3jfa0wfh",
					"above_bar_code_image_url": above_bar_code_image_url,
					"flight_info": {
						"flight_number": "KL0642",
						"departure_airport": {
							"airport_code": "JFK",
							"city": "New York",
							"terminal": "T1",
							"gate": "D57"
						},
						"arrival_airport": {
							"airport_code": "AMS",
							"city": "Amsterdam"
						},
						"flight_schedule": {
							"departure_time": "2016-01-02T19:05",
							"arrival_time": "2016-01-05T17:30"
						}
					}
				}]
			}
		}
	}
	sendMessage(sender, message, token)
}

// Send Flight Update Message
function sendFlightUpdateMessage(sender, token) {
	let intro_message = "Your flight is delayed"
	let message = {
		"attachment": {
			"type": "template",
      		"payload": {
      			"template_type": "airline_update",
        		"intro_message": intro_message,
				"update_type": "delay",
				"locale": "en_US",
				"pnr_number": "CF23G2",
				"update_flight_info": {
					"flight_number": "KL123",
					"departure_airport": {
						"airport_code": "SFO",
						"city": "San Francisco",
						"terminal": "T4",
						"gate": "G8"
					},
					"arrival_airport": {
						"airport_code": "AMS",
						"city": "Amsterdam",
						"terminal": "T4",
						"gate": "G8"
					},
					"flight_schedule": {
						"boarding_time": "2015-12-26T10:30",
						"departure_time": "2015-12-26T11:30",
						"arrival_time": "2015-12-27T07:30"
					}
				}
			}
		}
	}
	sendMessage(sender, message, token)
}

// Send Error Message
function sendTemplateMessage(sender, token) {
	let templates = ["Itinerary","Checkin Reminder","Boarding Pass","Flight Update"]
	let numberOfTemplates = templates.length
	let i = 0
	let quick_replies = []
	for (i; i < numberOfTemplates; i++) {
		let template = templates[i]
		quick_replies.push({
			"content_type":"text",
			"title":template,
			"payload":template
		})
	}
	let text = "Pick a template:"
	let message = {
		"text": text,
		"quick_replies": quick_replies
	}
	sendMessage(sender, message, token)
}

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})
