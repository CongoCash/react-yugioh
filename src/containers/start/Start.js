import React, { Component } from 'react'
import GamesModel from '../../models/Game.js'
import Game from '../game/Game.js'
import './Start.css';

class Start extends Component {

    constructor(){
        super()
        this.state = {
            game_been_clicked: false,
            available_games: [],
            selected_id: ""
        }
    }

    componentWillMount(){
        this.fetchData()
    }

    fetchData(){
        GamesModel.all().then((res) => {
            this.setState({
                available_games: res.data
            })
        })
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
        GamesModel.destroy(id)
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
                            <button className="btn btn-success" onClick={this.createGame.bind(this)}>Create Game</button>
                        </div>
                    </div>
                : ""}
                {!this.state.game_been_clicked ?
                    this.state.available_games.map((game) => {
                        return(
                            <div className="row">
                                <div className="col-sm-2 col-sm-offset-5">
                                    <button className="btn btn-primary" onClick={this.startGame.bind(this)}>Game {game.id}</button>
                                    <button className="btn btn-danger" onClick={() => this.deleteGame(game.id)}>Delete</button>
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