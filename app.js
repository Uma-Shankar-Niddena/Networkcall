const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasepath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null
const initializedbserver = async () => {
  try {
    db = await open({
      filename: databasepath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running ... enjoy pandagoww')
    })
  } catch (e) {
    console.log(`something went wron ${e.message}`)
  }
}
initializedbserver()

///GEt listof players in the playertable
app.get('/players/', async (request, response) => {
  const querytogetallaplayer = `SELECT player_id as playerId, player_name as playerName from player_details`
  const playerresfromdb = await db.all(querytogetallaplayer)
  response.send(playerresfromdb)
})

///GEt specific player with playerid
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const querygetSpecific = `SELECT player_id as playerId, player_name as playerName FROM player_details WHERE player_id=${playerId}`
  const playeridresfromdb = await db.get(querygetSpecific)
  response.send(playeridresfromdb)
})

///PUT specific player by playerid
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails
  const queryforupdatePlayer = `UPDATE player_details SET player_name="${playerName}" WHERE player_id="${playerId}"`
  const resfromdb = await db.run(queryforupdatePlayer)
  response.send('Player Details Updated')
})

/// GEt match details
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const queryformatchdetails = `SELECT match_id as matchId, match as match, year as year FROM match_details WHERE match_id =${matchId}`
  const matchresfromdb = await db.get(queryformatchdetails)
  response.send(matchresfromdb)
})

/// GET allthe matches of a player
app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const queryforplayer = `SELECT match_details.match_id AS matchId, match_details.match AS match, match_details.year AS year FROM match_details NATURAL JOIN player_details WHERE player_details.player_id=${playerId}`

  const matchderesfromdb = await db.all(queryforplayer)
  response.send(matchderesfromdb)
})

/// GET list of players of a specific match

app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params
  const querytogetplayer = `SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`
  const listofplayerresfromdb = await db.all(querytogetplayer)
  response.send(listofplayerresfromdb)
})

/// GET total fours scores sixes
app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const queryforplayernames = `SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`
  const tatalscoreresfromdb = await db.get(queryforplayernames)
  response.send(tatalscoreresfromdb)
})
module.exports = app
