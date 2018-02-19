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
            lifepoints1: [], lifepoints2: [],
            background_set: false
        }
    }

    componentWillMount(){
        this.fetchData()
    }

    fetchData(){
        this.getGameData()

    }

    setBackground = () => {
        this.setState({
          background_set: true
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
        console.log(e.target.innerHTML.split(" ")[1])
        this.setState({
            // selected_id: e.target.innerHTML.split(" ")[1],
            selected_id: 105,
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
            <div className="container-fluid">

                {!this.state.game_been_clicked ?
                  <div>
                      <div className="start-bg-img"></div>
                      <div className="row">
                        <div className="col-sm-6">
                            <div className="button-placement">
                                <button className="btn btn-lg btn-success center-create button-glow"
                                        onClick={this.startGame.bind(this)}>Start Game
                                </button>
                            </div>
                        </div>
                      </div>
                  </div>
                  : ""}
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