'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT_EXTERNAL || 80;
const logger = require('./src/logger');

app.get('/healthcheck', (req, res) => {
	res.sendStatus(200);
});

app.get('/', (req, res) => {
	const endpointInformation = {
		links: {
			self: {
				href: req.originalUrl
			},
		},
		data: {
			GetEpisodesFeed: {
				return: "Episode[]",
				href: "/feeds{?url}",
				method: "get"
			}
		}
	};
	res.send(endpointInformation);
});

app.get('/feeds', async (req, res) => {
	if(!req.query.url || req.query.url.length === 0) {
		res.status(400).send({message: 'required param missing (url)'});
		return;
	}
  // const json = await GetEpisodesFeed(req);
  const json = {blahonga: "yeah"}
  res.set('Content-Type', 'application/json');
  res.send(json);
});

app.listen(port, () => {
	logger.info(`Listening at ${port}`);
});
