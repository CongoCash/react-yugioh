import React, { Component } from 'react'
import GamesModel from '../../models/Game.js'
import Game from '../game/Game.js'
import './Start.css';
import {ProgressBar} from 'react-bootstrap'

class Start extends Component {

    constructor(){
        super()
        this.state = {
            game_been_clicked: false,
            available_games: [],
            selected_id: "",
            lifepoints1: [], lifepoints2: []
        }
    }

    componentWillMount(){
        this.fetchData()
    }

    fetchData(){
        this.getGameData()

    }

    createGame() {
        GamesModel.create()
        GamesModel.all().then((res) => {
            this.setState({
                available_games: res.data
            })
        })
    }

    startGame(e) {

        this.setState({
            selected_id: e.target.innerHTML.split(" ")[1],
            game_been_clicked: true
        })
    }

    deleteGame(id) {
        GamesModel.destroy(id).then(() => {
            this.getGameData()
        })
    }

    getGameData() {
        let counter = 0
        GamesModel.all().then((res) => {
            this.setState({
                available_games: res.data
            })

            res.data.forEach((id) => {
                GamesModel.specific(id.id).then((res) => {
                    this.state.lifepoints1.push(res.data.game.lifepoints1)
                    this.state.lifepoints2.push(res.data.game.lifepoints2)
                }).then(() => {
                    counter++
                    if (counter === res.data.length) {
                        this.setState({
                            lifepoints1: this.state.lifepoints1,
                            lifepoints2: this.state.lifepoints2
                        })
                    }
                })
            })
        })
    }

    render() {

        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-2 col-sm-offset-5 background-header">
                    </div>
                </div>
                {!this.state.game_been_clicked ?
                    <div className="row">
                        <div className="col-sm-2 col-sm-offset-5">
                            <button className="btn btn-lg btn-success center-create" onClick={this.createGame.bind(this)}>Create Game</button>
                        </div>
                    </div>
                : ""}
                {!this.state.game_been_clicked ?
                    this.state.available_games.map((game, index) => {
                        return(
                            <div className="row">
                                <div className="col-sm-2 col-sm-offset-3">
                                    <h5>Player 1 Lifepoints: {this.state.lifepoints1[index]}</h5>
                                    <ProgressBar now={this.state.lifepoints1[index]/8000*100} />
                                </div>
                                <div className="col-sm-2 no-padding">
                                    <button className="btn btn-primary spacing-buttons margin-start" onClick={this.startGame.bind(this)}>Game {game.id}</button>
                                    <button className="btn btn-danger spacing-buttons" onClick={() => this.deleteGame(game.id)}>Delete</button>
                                </div>
                                <div className="col-sm-2">
                                    <h5>Player 2 Lifepoints: {this.state.lifepoints2[index]}</h5>
                                    <ProgressBar now={this.state.lifepoints2[index]/8000*100} />
                                </div>
                            </div>
                        )
                }) : ""}
                {this.state.selected_id ?
                    <Game
                        game_id={this.state.selected_id}
                    /> : ""
                }
            </div>
        )
    }
}

export default Start