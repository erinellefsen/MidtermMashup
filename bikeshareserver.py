from flask import Flask, request
import requests as req
import json
from json import dumps

app = Flask(__name__)


@app.route('/proxy/getbikes')
def get_bikes():
    res = req.get('http://api.citybik.es/v2/networks')
    return res.text


@app.route('/proxy/getnetwork')
def get_network():
    args = request.url.split('?')[1]
    res = req.get('http://api.citybik.es/v2/networks/{}'.format(args))

    return res.text


@app.route('/proxy/getlatlong')
def get_lat_long():
    args = request.url.split('?')[1]
    res = req.get('https://maps.googleapis.com/maps/api/geocode/json?{}'.format(args))

    return res.text



app.run(debug=True)
