import React, { Component } from 'react'
import Hand from'../hand/Hand.js'
import Spell_field from'../spell_field/Spell_field.js'
import Monster_field from'../monster_field/Monster_field.js'
import './Board.css';



class Board extends Component {

    constructor(){
        super()
        // this.state = {
        //     hand: this.props.hand
        // }
    }

    render() {
        return(
            <div className="col-sm-12">
                <div>
                    <Hand
                        hand={this.props.hand2}
                        deck={this.props.deck2}
                    />
                </div>
                    <div>
                        <Spell_field
                            spell_field={this.props.spell_field2.map((spell) => {
                                return(
                                    <img onClick={this.props.select_spell} id={"p2s" + spell.id} className="col-sm-1 player2 card" height="100" width="68" src={"https://i.pinimg.com/originals/ed/b7/02/edb702c8400d4b0c806d964380b03b6a.jpg"}/>
                                )
                            })}
                            spell_slots={this.props.spell_slots2.map((slot) => {
                                return(
                                    <img className="col-sm-1 player2 card" height="100" width="68" src="https://i.imgur.com/HuXvLaa.png" />
                                )
                            })}
                        />
                    </div>

                    <div>
                        <Monster_field
                            monster_field={this.props.monster_field2.map((monster) => {
                                return(
                                    monster.position === 'attack'?
                                        <img id={"p2m" + monster.id} onClick={this.props.main_phase1_2} className="col-sm-1 player2 card" height="100" width="68" src={monster.image_url}/>
                                        : <img id={"p2m" + monster.id} onClick={this.props.main_phase1_2} className="col-sm-1 player2 card" height="68" width="100" src={"http://vignette3.wikia.nocookie.net/yugioh/images/6/68/Face_Down_Defense_Position.png/revision/latest?cb=20100726091546"}/>
                                )
                            })}
                            monster_slots={this.props.monster_slots2.map((slot) => {
                                return(
                                    <img className="col-sm-1 player2 card" height="100" width="68" src="https://i.imgur.com/tqeeCjU.png" />
                                )
                            })}
                        />
                    </div>
                    <hr></hr>
                    <div>
                        <Monster_field
                            monster_field={this.props.monster_field1.map((monster) => {
                                return(
                                    monster.position === 'attack'?
                                    <img id={"p1m" + monster.id} onClick={this.props.main_phase1_2} className="col-sm-1 player1 card" height="100" width="68" src={monster.image_url}/>
                                        : <img id={"p1m" + monster.id} onClick={this.props.main_phase1_2} className="col-sm-1 player1 card" height="68" width="100" src={"http://vignette3.wikia.nocookie.net/yugioh/images/6/68/Face_Down_Defense_Position.png/revision/latest?cb=20100726091546"}/>
                                )
                            })}
                            monster_slots={this.props.monster_slots1.map((slot) => {
                                return(
                                    <img className="col-sm-1 player1 card" height="100" width="68" src="https://i.imgur.com/tqeeCjU.png" />
                                )
                            })}
                        />
                    </div>

                    <div>
                        <Spell_field
                            spell_field={this.props.spell_field1.map((spell) => {
                                return(
                                    <img onClick={this.props.select_spell} id={"p1s" + spell.id} className="col-sm-1 player1 card" height="100" width="68" src={"https://i.pinimg.com/originals/ed/b7/02/edb702c8400d4b0c806d964380b03b6a.jpg"}/>
                                )
                            })}
                            spell_slots={this.props.spell_slots1.map((slot) => {
                                return(
                                    <img className="col-sm-1 player1 card" height="100" width="68" src="https://i.imgur.com/HuXvLaa.png" />
                                )
                            })}
                        />
                    </div>

                    <div>
                        <Hand
                            hand={this.props.hand1}
                            deck={this.props.deck1}
                        />
                    </div>
            </div>
        )
    }
}

export default Board