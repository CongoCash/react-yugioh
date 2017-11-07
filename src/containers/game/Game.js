import React, { Component } from 'react'
import YugisModel from '../../models/Yugi.js'
import KaibasModel from '../../models/Kaiba.js'
import Board from '../../containers/board/Board.js'
import './Game.css';
import GamesModel from "../../models/Game";
import Cable from 'actioncable'
import {ProgressBar} from 'react-bootstrap'

class Game extends Component {
    constructor(){
        super()
        this.state = {
            player1: "", player2: "",
            lifepoints1: "", lifepoints2: '',
            turn: '', phase: '', phase_name: '',
            deck1: [], deck2: [], hand1: [], hand2: [],
            monster_field1: [], monster_field2: [],
            monster_slots1: [], monster_slots2: [],
            spell_field1: [], spell_field2: [],
            spell_slots1: [], spell_slots2: [],
            monster_selected: '', selected_monster: '',
            monster_played: '', has_drawn: '',
            attacker_selected: '', target_selected: '',
            selected_attacker: '', selected_target: '',
            selected_has_attacked: '', first_turn: '',
            winner: '', selected_card: '', current_move: '',
            exodia1: [], exodia2: [], selected_sacrifices: [],
            selected_spell: '',
        }
    }

    componentWillMount(){
        this.fetchData()
        this.createSocket();
    }

    fetchData(){

        //I initially was going to constantly grab/send data to the database in an effort
        //to make this 2 player, but the idea was scrapped due to time
        GamesModel.specific(this.props.game_id).then((res) => {
            console.log(res.data.game.lifepoints1, 'phase data')
            this.setState({
                lifepoints1: res.data.game.lifepoints1, lifepoints2: res.data.game.lifepoints2,
                turn: res.data.game.turn, phase: res.data.game.phase, phase_name: res.data.game.phase_name,
                deck1: res.data.game.deck1, deck2: res.data.game.deck2, hand1: res.data.game.hand1, hand2: res.data.game.hand2,
                monster_field1: res.data.game.monster_field1, monster_field2: res.data.game.monster_field2,
                spell_field1: res.data.game.spell_field1, spell_field2: res.data.game.spell_field2,
                monster_selected: res.data.game.monster_selected, selected_monster: res.data.game.selected_monster,
                monster_played: res.data.game.monster_played, has_drawn: res.data.game.has_drawn,
                attacker_selected: res.data.game.attacker_selected, target_selected: res.data.game.target_selected,
                selected_attacker: res.data.game.selected_attacker, selected_target: res.data.game.selected_target,
                selected_has_attacked: res.data.game.selected_has_attacked, first_turn: res.data.game.first_turn,
                winner: res.data.game.winner, selected_card: res.data.game.selected_card,
                monster_slots1: res.data.game.monster_slots1, monster_slots2: res.data.game.monster_slots2,
                spell_slots1: res.data.game.spell_slots1, spell_slots2: res.data.game.spell_slots2,

            }, function() {
                this.getInitialCards()
                console.log(this.state.spell_slots2)
            })
        })
    }

    getInitialCards() {
        var shuffle = require('shuffle-array')

        YugisModel.cards().then((res) => {
            let data = res.data
            let shuffle_deck1 = shuffle(data)
            let hand1 = shuffle_deck1.slice(0,5)
            let deck1 = shuffle_deck1.slice(5)

            this.setState({
                hand1: hand1,
                deck1: deck1,
            }, function() {
                this.winCondition()
            })
        })

        KaibasModel.cards().then((res) => {
            let data = res.data
            let shuffle_deck2 = shuffle(data)
            let hand2 = shuffle_deck2.slice(0,5)
            let deck2 = shuffle_deck2.slice(5)

            this.setState({
                hand2: hand2,
                deck2: deck2,
            }, function() {
                this.winCondition()
            })
        })
    }

    endPhase() {
        this.setState({
            monster_selected: false, monster_played: false,
            has_drawn: false,
            selected_monster: "", selected_attacker: "",
            selected_target: "", selected_spell: "",
            attacker_selected: false, target_selected: false,
            selected_has_attacked: false,
        })

        if (this.state.turn === "player1") {
            if (this.state.phase !== 4) {
                this.setState({
                    phase: this.state.phase+1,
                })
            }
            else {
                this.state.monster_field1.forEach((monster) => {
                    monster.has_changed_battle_position = false
                    monster.has_attacked = false
                })
                this.setState({
                    turn: "player2", phase: 0,
                    first_turn: false
                })
            }
        }
        else if (this.state.turn === "player2") {
            if (this.state.phase !== 4) {
                this.setState({
                    phase: this.state.phase+1,
                })
            }
            else {
                this.state.monster_field2.forEach((monster) => {
                    monster.has_changed_battle_position = false
                    monster.has_attacked = false
                })
                this.setState({
                    turn: "player1", phase: 0,
                    first_turn: false
                })
            }
        }
    }

    drawCard(e) {
        if (!this.state.has_drawn && this.state.phase === 0) {
            if (e.target.alt === "Deck 1" && this.state.turn === 'player1') {
                let new_card = this.state.deck1.shift()
                this.state.hand1.push(new_card)
                this.setState({
                    hand1: this.state.hand1,
                    has_drawn: true,
                }, function() {
                    this.winCondition()
                })
            }

            else if (e.target.alt === "Deck 2" && this.state.turn === 'player2') {
                let new_card = this.state.deck2.shift()
                this.state.hand2.push(new_card)
                this.setState({
                    hand2: this.state.hand2,
                    has_drawn: true,
                }, function() {
                    this.winCondition()
                })
            }
        }
        this.updateCurrentMove(e)
        this.handleSendEvent(e)
    }

    selectMonster(e) {
        let combined_hands = this.state.hand1.concat(this.state.hand2)
        let monster = combined_hands.find((card) => {
            console.log(card, 'looping through cards')
            return (card.image_url === e.target.src)
        })
        if (this.state.turn === 'player1') {
            this.setState({
                selected_card: monster,
            }, function () {
                console.log(this.state.selected_card, 'selected card')
            })

            if (e.target.className.split(' ')[1] === 'player1'
                && this.state.turn === 'player1' && this.state.phase === 1) {

                this.setState({
                    monster_selected: true,
                    selected_monster: monster,
                })
            }
        }
        else {
            this.setState({
                selected_card: monster,
            }, function () {
                console.log(this.state.selected_card, 'selected_card')
            })
            if (e.target.className.split(' ')[1] === 'player2'
                && this.state.phase === 1) {
                this.setState({
                    monster_selected: true,
                    selected_monster: monster,
                })
            }
        }
    }

    setSpell(e) {
        if (this.state.turn === 'player1') {
            let spell_index = this.state.hand1.findIndex((spell) => {
                return spell === this.state.selected_monster
            })
            this.state.hand1[spell_index].spell_played = true
            this.state.spell_field1.push(this.state.hand1[spell_index])
            this.state.hand1.splice(spell_index, 1)
            this.state.spell_slots1.pop()
            this.setState({
                spell_field1: this.state.spell_field1,
                hand1: this.state.hand1,
                spell_slots1: this.state.spell_slots1
            }, function() {
                console.log(this.state.spell_field1, 'spell field')
            })
        }

        else if (this.state.turn === 'player2') {
            console.log(this.state.selected_monster)
            let spell_index = this.state.hand2.findIndex((spell) => {
                console.log(spell)
                return spell === this.state.selected_monster
            })
            console.log(spell_index, 'spell index')
            this.state.hand2[spell_index].spell_played = true
            this.state.spell_field2.push(this.state.hand1[spell_index])
            this.state.hand2.splice(spell_index, 1)
            this.state.spell_slots2.pop()
            this.setState({
                spell_field2: this.state.spell_field2,
                hand2: this.state.hand2,
                spell_slots2: this.state.spell_slots2
            }, function() {
                console.log(this.state.spell_field2, 'spell field')
            })
        }

    }

    selectSpell(e){
        console.log('enter selectSpell')
        if (this.state.turn === 'player1') {
            let find_spell = this.state.spell_field1.find((spell) => {
                return spell.id == e.target.id.split('p1s')[1]
            })
            this.setState({
                selected_card: find_spell,
                selected_spell: find_spell
            })
        }

        else if (this.state.turn === 'player2') {
            let find_spell = this.state.spell_field2.find((spell) => {
                return spell.id == e.target.id.split('p2s')[1]
            })
            this.setState({
                selected_card: find_spell,
                selected_spell: find_spell
            })
        }
    }

    playSpell() {
        console.log(this.state.spell_slots1, 'spell slots before')
        if (this.state.selected_spell.card_name === 'Dark Hole') {
            this.state.monster_field1 = []
            this.state.monster_field2 = []
            if (this.state.turn === 'player1') {
                let spell_index = this.state.spell_field1.findIndex((spell) => {
                    return spell.card_name === 'Dark Hole'
                })
                this.state.spell_field1.splice(spell_index, 1)
                this.state.spell_slots1.push(false)
            }
            else if (this.state.turn === 'player2') {
                let spell_index = this.state.spell_field2.findIndex((spell) => {
                    return spell.card_name === 'Dark Hole'
                })
                this.state.spell_field1.splice(spell_index, 1)
                this.state.spell_slots2.push(false)
            }
            this.setState({
                monster_field1: [], monster_field2: [],
                spell_field1: this.state.spell_field1, spell_field2: this.state.spell_field2,
                spell_slots1: this.state.spell_slots1, spell_slots2: this.state.spell_slots2,
                monster_slots1: [false, false ,false, false, false], monster_slots2: [false, false, false, false, false],
                selected_spell: ""
            })
        }
    }


    playMonster(e) {
        if (this.state.monster_played === false && this.state.selected_monster.stars <= 4) {
            if (e.target.innerHTML === "Set Attack") {
                this.state.selected_monster.position = "attack"
                this.state.selected_monster.has_changed_battle_position = true
                this.state.selected_monster.faceup = true
                if (this.state.turn === "player1") {
                    let remove_card = this.state.hand1.findIndex((card) => {
                        return card === this.state.selected_monster
                    })
                    this.state.hand1.splice(remove_card, 1)
                    this.state.monster_field1.push(this.state.selected_monster)
                    this.state.monster_slots1.pop()
                    this.setState({
                        monster_field1: this.state.monster_field1,
                        hand1: this.state.hand1,
                        monster_played: true,
                        monster_selected: false,
                        monster_field1: this.state.monster_field1,
                        monster_slots1: this.state.monster_slots1
                    }, function () {
                        console.log(this.state.monster_field1)
                    })
                }
                else if (this.state.turn === "player2") {
                    let remove_card = this.state.hand2.findIndex((card) => {
                        return card === this.state.selected_monster
                    })
                    this.state.hand2.splice(remove_card, 1)
                    this.state.monster_field2.push(this.state.selected_monster)
                    this.state.monster_slots2.pop()
                    this.setState({
                        monster_field2: this.state.monster_field2,
                        hand2: this.state.hand2,
                        monster_played: true,
                        monster_selected: false,
                        monster_slots2: this.state.monster_slots2
                    }, function () {
                        console.log(this.state.monster_field2)
                    })
                }
            }
            else if (e.target.innerHTML === "Set Defense") {
                this.state.selected_monster.position = "defense"
                if (this.state.turn === "player1") {
                    let remove_card = this.state.hand1.findIndex((card) => {
                        return card === this.state.selected_monster
                    })
                    this.state.hand1.splice(remove_card, 1)
                    this.state.monster_field1.push(this.state.selected_monster)
                    this.state.monster_slots1.pop()
                    this.setState({
                        monster_field1: this.state.monster_field1,
                        hand1: this.state.hand1,
                        monster_played: true,
                        monster_selected: false,
                        monster_slots1: this.state.monster_slots1
                    }, function () {
                        console.log(this.state.monster_field1)
                    })
                }
                else if (this.state.turn === "player2") {
                    let remove_card = this.state.hand2.findIndex((card) => {
                        return card === this.state.selected_monster
                    })
                    this.state.hand2.splice(remove_card, 1)
                    this.state.monster_field2.push(this.state.selected_monster)
                    this.state.monster_slots2.pop()
                    this.setState({
                        monster_field2: this.state.monster_field2,
                        hand2: this.state.hand2,
                        monster_played: true,
                        monster_selected: false,
                        monster_slots2: this.state.monster_slots2
                    }, function () {
                        console.log(this.state.monster_field2)
                    })
                }
            }
        }
    }

    selectSacrifices(e) {
        if (this.state.phase === 1 && this.state.turn === 'player1'
        && this.state.selected_monster.stars > 4 && this.state.selected_monster.stars < 7) {
            let sacrifice = this.state.monster_field1.find((monster) => {
                console.log(monster.image_url === e.target.src)
                return monster.image_url === e.target.src
            })
            console.log(sacrifice, 'what is this sacrifice)')
            if (sacrifice.selected_sac === false) {
                this.state.selected_sacrifices[0] = sacrifice
                sacrifice.selected_sac = true
                console.log(sacrifice, 'is this coming in before selected sacrifices state')
            }
            this.setState({
                selected_sacrifices: this.state.selected_sacrifices
            }, function() {
                console.log(this.state.selected_sacrifices, 'selected sacrifices state')
            })
            this.state.monster_field1.forEach((monster) => {
                console.log('the end')
                monster.selected_sac = false
            })
        }

        if (this.state.phase === 1 && this.state.turn === 'player1'
            && this.state.selected_monster.stars >= 7) {
            let sacrifice = this.state.monster_field1.find((monster) => {
                return (monster.image_url === e.target.src && monster.selected_sac === false)
            })
            if (this.state.selected_sacrifices.length < 2) {
                sacrifice.selected_sac === true
                this.state.selected_sacrifices.push(sacrifice)
                console.log(this.state.selected_sacrifices, 'before setting the state')
                this.setState({
                    selected_sacrifices: this.state.selected_sacrifices
                }, function() {
                    console.log(this.state.selected_sacrifices, 'after setting the state')
                })
            }

            else if (this.state.selected_sacrifices.length >= 2) {
                sacrifice.selected_sac === true
                this.state.selected_sacrifices.shift()
                this.state.selected_sacrifices.push(sacrifice)

                this.setState({
                    selected_sacrifices: this.state.selected_sacrifices
                }, function() {
                    console.log(this.state.selected_sacrifices, 'greater than 2 sacrifices')
                })
            }
        }


        if (this.state.phase === 1 && this.state.turn === 'player2'
            && this.state.selected_monster.stars > 4 && this.state.selected_monster.stars < 7) {
            let sacrifice = this.state.monster_field2.find((monster) => {
                console.log(monster.image_url === e.target.src)
                return monster.image_url === e.target.src
            })
            console.log(sacrifice, 'what is this sacrifice)')
            if (sacrifice.selected_sac === false) {
                this.state.selected_sacrifices[0] = sacrifice
                sacrifice.selected_sac = true
                console.log(sacrifice, 'is this coming in before selected sacrifices state')
            }
            this.setState({
                selected_sacrifices: this.state.selected_sacrifices
            }, function() {
                console.log(this.state.selected_sacrifices, 'selected sacrifices state')
            })
            this.state.monster_field1.forEach((monster) => {
                console.log('the end')
                monster.selected_sac = false
            })
        }

        if (this.state.phase === 1 && this.state.turn === 'player2'
            && this.state.selected_monster.stars >= 7) {
            let sacrifice = this.state.monster_field2.find((monster) => {
                return (monster.image_url === e.target.src && monster.selected_sac === false)
            })
            if (this.state.selected_sacrifices.length < 2) {
                sacrifice.selected_sac === true
                this.state.selected_sacrifices.push(sacrifice)
                console.log(this.state.selected_sacrifices, 'before setting the state')
                this.setState({
                    selected_sacrifices: this.state.selected_sacrifices
                }, function() {
                    console.log(this.state.selected_sacrifices, 'after setting the state')
                })
            }

            else if (this.state.selected_sacrifices.length >= 2) {
                sacrifice.selected_sac === true
                this.state.selected_sacrifices.shift()
                this.state.selected_sacrifices.push(sacrifice)

                this.setState({
                    selected_sacrifices: this.state.selected_sacrifices
                }, function() {
                    console.log(this.state.selected_sacrifices, 'greater than 2 sacrifices')
                })
            }
        }

    }

    summonMonster(e) {
        console.log('entering summon')
        this.state.selected_monster.position = 'attack'
        if (this.state.turn === 'player1' && this.state.selected_monster.stars > 4) {
            this.state.selected_sacrifices.forEach((sacrifice, index) => {
                let sac_index = this.state.monster_field1.findIndex((monster) => {
                    return monster === sacrifice
                })
                this.state.monster_field1.splice(sac_index, 1)
            })
            this.state.monster_field1.push(this.state.selected_monster)
            let hand_index = this.state.hand1.findIndex((card) => {
                return card === this.state.selected_monster
            })
            this.state.hand1.splice(hand_index, 1)
            this.setState({
                monster_field1: this.state.monster_field1,
                selected_sacrifice: [],
                monster_selected: false,
                selected_monster: "",
                hand1: this.state.hand1
            })
        }

        else if (this.state.turn === 'player2' && this.state.selected_monster.stars > 4) {
            this.state.selected_sacrifices.forEach((sacrifice, index) => {
                let sac_index = this.state.monster_field2.findIndex((monster) => {
                    return monster === sacrifice
                })
                this.state.monster_field2.splice(sac_index, 1)
            })
            this.state.monster_field2.push(this.state.selected_monster)
            let hand_index = this.state.hand2.findIndex((card) => {
                return card === this.state.selected_monster
            })
            this.state.hand2.splice(hand_index, 1)
            this.setState({
                monster_field2: this.state.monster_field2,
                selected_sacrifice: [],
                monster_selected: false,
                selected_monster: "",
                hand2: this.state.hand2
            })
        }
    }

    selectAttacker(e) {
        if (this.state.phase === 2) {
            if (this.state.turn === 'player1') {
                if (e.target.className.split(' ')[1] === 'player1') {
                    let selected_monster = this.state.monster_field1.find((monster) => {
                        return monster.id == e.target.id.split('m')[1]
                    })
                    console.log(selected_monster)
                    if (selected_monster.position === 'attack') {
                        this.setState({
                            selected_attacker: selected_monster,
                            attacker_selected: true,
                            selected_has_attacked: selected_monster.has_attacked,
                            selected_card: selected_monster,
                        }, function () {
                            console.log(this.state.selected_attacker, 'attacker selected player1')
                        })
                    }
                    else {
                        this.setState({
                            selected_card: selected_monster
                        })
                    }
                }
            }

            else if (this.state.turn === 'player2') {
                console.log(e.target.className.split(' ')[1], 'target classname')
                if (e.target.className.split(' ')[1] === 'player2') {
                    let selected_monster = this.state.monster_field2.find((monster) => {
                        return monster.id == e.target.id.split('m')[1]
                    })

                    if (selected_monster.position === 'attack') {
                        this.setState({
                            selected_attacker: selected_monster,
                            attacker_selected: true,
                            selected_has_attacked: selected_monster.has_attacked,
                            selected_card: selected_monster,
                        })
                    }
                    else {
                        this.setState({
                            selected_card: selected_monster
                        })
                    }
                }
            }
        }
    }

    selectTarget(e) {
        console.log(e.target.id.split('m')[1])
        if (this.state.phase === 2) {
            if (this.state.turn === 'player1') {
                if (e.target.className.split(' ')[1] === 'player2') {
                    let selected_target = this.state.monster_field2.find((target) => {
                        return target.id == e.target.id.split('m')[1]
                    })

                    this.setState({
                        selected_target: selected_target,
                        target_selected: true,
                        selected_card: selected_target,
                    }, function () {
                        console.log(this.state.selected_target, 'target selected player1 turn')
                    })
                }
            }

            else if (this.state.turn === 'player2') {
                if (e.target.className.split(' ')[1] === 'player1') {
                    let selected_target = this.state.monster_field1.find((target) => {
                        console.log(target, 'this is the target')
                        console.log(this.state.monster_field1, 'monster field 1')
                        return target.id == e.target.id.split('m')[1]
                    })

                    this.setState({
                        selected_target: selected_target,
                        target_selected: true,
                        selected_card: selected_target,
                    }, function () {
                        console.log(this.state.selected_target, 'target selected player2 turn')
                    })
                }
            }
        }
    }

    selectAttackTarget(e) {
        console.log(e.target.id.split('m'))
        let monster = this.state.monster_field1.concat(this.state.monster_field2).find((monster) => {
            return monster.id == e.target.id.split('m')[1]
        })
        this.setState({
            selected_card: monster
        })
        this.selectAttacker(e)
        this.selectTarget(e)
    }

    attack() {
        if (this.state.attacker_selected && !this.state.selected_attacker.has_attacked) {
            console.log('entering attack')
            console.log(this.state.selected_attacker.has_attacked, 'before')
            this.state.selected_attacker.has_attacked = true
            console.log(this.state.selected_attacker.has_attacked, 'after')
            //direct attack
            if ((this.state.monster_field1.length === 0 || this.state.monster_field2.length === 0)) {
                console.log('direct')
                if (this.state.turn === 'player1') {
                    this.setState({
                        lifepoints2: this.state.lifepoints2 - this.state.selected_attacker.attack
                    }, function () {
                        console.log(this.state.lifepoints2)
                        this.winCondition()
                    })
                }
                else if (this.state.turn === 'player2') {
                    this.setState({
                        lifepoints1: this.state.lifepoints1 - this.state.selected_attacker.attack
                    }, function () {
                        console.log(this.state.lifepoints1)
                        this.winCondition()
                    })
                }
            }

            //attacking a monster in attack mode
            else if (this.state.turn === 'player1') {
                let found_attacker = this.state.monster_field1.findIndex((attacker) => {
                    return attacker === this.state.selected_attacker
                })
                let found_target = this.state.monster_field2.findIndex((target) => {
                    return target === this.state.selected_target
                })
                if (this.state.selected_target.position === 'attack') {
                    console.log('att vs att1')
                    if (this.state.selected_attacker.attack > this.state.selected_target.attack) {
                        this.state.monster_field2.splice(found_target, 1)
                        this.state.monster_slots2.push(false)
                        this.setState({
                            lifepoints2: this.state.lifepoints2 - (this.state.selected_attacker.attack - this.state.selected_target.attack),
                            monster_field2: this.state.monster_field2,
                            monster_slots2: this.state.monster_slots2
                        }, function () {
                            console.log(this.state.lifepoints2)
                            this.winCondition()
                        })
                    }
                    else if (this.state.selected_attacker.attack < this.state.selected_target.attack) {
                        this.state.monster_field1.splice(found_attacker, 1)
                        this.state.monster_slots1.push(false)
                        this.setState({
                            lifepoints1: this.state.lifepoints1 - (this.state.selected_target.attack - this.state.selected_attacker.attack),
                            monster_field1: this.state.monster_field1,
                            monster_slots1: this.state.monster_slots1
                        }, function () {
                            console.log(this.state.lifepoints1)
                            this.winCondition()
                        })
                    }
                }

                //attacking a target in defense position
                else if (this.state.selected_target.position === 'defense') {
                    console.log('att vs def1')
                    if (this.state.selected_attacker.attack > this.state.selected_target.defense) {
                        this.state.monster_field2.splice(found_target, 1)
                        this.state.monster_slots2.push(false)
                        this.setState({
                            monster_field2: this.state.monster_field2,
                            monster_slots2: this.state.monster_slots2
                        }, function () {
                            console.log(this.state.lifepoints2)
                            this.winCondition()
                        })
                    }
                    else if (this.state.selected_attacker.attack < this.state.selected_target.defense) {
                        this.state.monster_field1.splice(found_attacker, 1)
                        this.state.monster_slots1.push(false)
                        this.setState({
                            lifepoints1: this.state.lifepoints1 - (this.state.selected_target.defense - this.state.selected_attacker.attack),
                            monster_field1: this.state.monster_field1,
                            monster_slots1: this.state.monster_slots1
                        }, function () {
                            console.log(this.state.lifepoints1)
                            this.winCondition()
                        })
                    }
                }
            }

            else if (this.state.turn === 'player2') {
                let found_attacker = this.state.monster_field2.findIndex((attacker) => {
                    return attacker === this.state.selected_attacker
                })
                let found_target = this.state.monster_field1.findIndex((target) => {
                    return target === this.state.selected_target
                })
                if (this.state.selected_target.position === 'attack') {
                    if (this.state.selected_attacker.attack > this.state.selected_target.attack) {
                        this.state.monster_field1.splice(found_target, 1)
                        this.state.monster_slots1.push(false)
                        this.setState({
                            lifepoints1: this.state.lifepoints1 - (this.state.selected_attacker.attack - this.state.selected_target.attack),
                            monster_field1: this.state.monster_field1,
                            monster_slots1: this.state.monster_slots1
                        })
                    }
                    else if (this.state.selected_attacker.attack < this.state.selected_target.attack) {
                        this.state.monster_field2.splice(found_attacker, 1)
                        this.state.monster_slots2.push(false)

                        this.setState({
                            lifepoints2: this.state.lifepoints2 - (this.state.selected_target.attack - this.state.selected_attacker.attack),
                            monster_field2: this.state.monster_field1,
                            monster_slots2: this.state.monster_slots2
                        })
                    }
                }


                else if (this.state.selected_target.position === 'defense') {
                    if (this.state.selected_attacker.attack > this.state.selected_target.defense) {
                        this.state.monster_field1.splice(found_target, 1)
                        this.state.monster_slots1.push(false)
                        this.setState({
                            monster_field1: this.state.monster_field1,
                            monster_slots1: this.state.monster_slots1
                        }, function () {
                            this.winCondition()
                        })
                    }
                    else if (this.state.selected_attacker.attack < this.state.selected_target.defense) {
                        this.state.monster_field2.splice(found_attacker, 1)
                        this.state.monster_slots2.push(false)
                        this.setState({
                            lifepoints2: this.state.lifepoints2 - (this.state.selected_target.defense - this.state.selected_attacker.attack),
                            monster_field2: this.state.monster_field2,
                            monster_slots2: this.state.monster_slots2
                        }, function () {
                            this.winCondition()
                        })
                    }
                }
            }

        }
        this.state.selected_attacker.has_attacked = true
        this.setState({
            selected_has_attacked: this.state.selected_attacker.has_attacked
        })
    }

    mainPhase2(e) {
        if (this.state.phase === 3) {
            if (this.state.turn === 'player1') {
                let monster = this.state.monster_field1.find((monster) => {
                    console.log(monster.image_url, 'monster.image_url')
                    return monster.image_url === e.target.src
                })
                if (typeof monster !== 'undefined') {
                    this.setState({
                        selected_monster: monster,
                        monster_selected: true
                    })
                }
                else {
                    let opposing = this.state.monster_field2.find((monster) => {
                        console.log(monster.image_url, 'monster.image_url')
                        return monster.image_url === e.target.src
                    })
                    if (typeof monster !== 'undefined') {
                        this.setState({
                            selected_card: opposing
                        })
                    }
                }
            }

            else if (this.state.turn === 'player2') {
                let monster = this.state.monster_field2.find((monster) => {
                    console.log(monster.image_url, 'monster.image_url')
                    return monster.image_url === e.target.src
                })
                if (typeof monster !== 'undefined') {
                    this.setState({
                        selected_monster: monster,
                        monster_selected: true
                    })
                }
                else {
                    let opposing = this.state.monster_field1.find((monster) => {
                        console.log(monster.image_url, 'monster.image_url')
                        return monster.image_url === e.target.src
                    })
                    if (typeof monster !== 'undefined') {
                        this.setState({
                            selected_card: opposing
                        })
                    }
                }
            }
        }
    }

    mainPhase1And2(e) {
        this.selectAttackTarget(e)
        this.selectSacrifices(e)
        this.mainPhase2(e)
    }

    switchPosition(e) {
        if (e.target.innerHTML === 'Switch to Defense Mode MP2') {
            this.state.selected_monster.position = 'defense'
        }
        else if (e.target.innerHTML === 'Switch to Attack Mode MP2') {
            this.state.selected_monster.position = 'attack'
        }
    }

    winCondition() {
        let EXODIA = ['Left Arm of the Forbidden One', 'Left Leg of the Forbidden One',
            'Right Arm of the Forbidden One', 'Right Leg of the Forbidden One',
            'Exodia the Forbidden One'
        ]

        EXODIA.forEach((card, index) => {
            let found1 = this.state.hand1.find((hand) => {
                return hand.card_name === card
            })
            if (found1) {
                this.state.exodia1.push(found1)
            }
            this.state.hand2.forEach((hand) => {
                if (hand.card_name === card) {
                    this.state.exodia2[index] = true
                }
            })
        })

        if (this.state.exodia1.length === 5) {
            this.setState({
                winner: 'Player 1'
            })
        }
        else{
            this.setState({
                exodia1: []
            })
        }


        if (this.state.exodia2[0] === true && this.state.exodia2[1] === true
            && this.state.exodia2[2] === true && this.state.exodia2[3] === true
            && this.state.exodia2[4] === true) {
            this.setState({
                winner: 'Player 2'
            })
        }

        else if (this.state.lifepoints1 <= 0) {
            this.setState({
                winner: 'Player 2'
            })
        }
        else if (this.state.lifepoints2 <= 0) {
            this.setState({
                winner: 'Player 1'
            })
        }
    }

    updateCurrentMove(e) {
        this.setState({
            current_move: e.target.value
        });
    }

    createSocket() {
        let cable = Cable.createConsumer('ws://localhost:3000/cable');
        this.moves = cable.subscriptions.create({
            channel: 'TwoPlayerChannel'
        }, {
            connected: () => {},
            received: (data) => {
                let moveLogs = this.state.moveLogs;
                moveLogs.push(data);
                this.setState({ moveLogs: moveLogs });
            },
            create: function(moveContent) {
                this.perform('create', {
                    content: moveContent
                });
            }
        });
    }

    handleSendEvent(e) {
        e.preventDefault();
        this.moves.create(this.state.current_move);
        this.setState({
            current_move: ''
        });
    }



    render() {
        let phase = (this.state.phase !== 4)
        let attack_button =
            (!this.state.first_turn) && (!this.state.selected_attacker.has_attacked) && (this.state.attacker_selected) &&
            (this.state.phase === 2) &&
            (this.state.target_selected || this.state.monster_field1.length === 0 || this.state.monster_field2.length === 0)
        let winCondition = (this.state.winner.length !== 0)
        console.log(this.state.lifepoints2, 'lp2')
        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-1">
                        <img onClick={this.drawCard.bind(this)} alt="Deck 2" height="100" width="68" src={"https://i.pinimg.com/originals/ed/b7/02/edb702c8400d4b0c806d964380b03b6a.jpg"}/>
                    </div>
                    <div className="col-sm-5">
                        <Board
                            hand1={this.state.hand1.map((card) => {
                                return(
                                    this.state.turn === 'player1' ?
                                    <img onClick={this.selectMonster.bind(this)} className="col-sm-1 player1 card"
                                         height="100" width="68" src={card.image_url}/> :
                                        <img alt="Hand 1" height="100" width="68"
                                             src={"https://i.pinimg.com/originals/ed/b7/02/edb702c8400d4b0c806d964380b03b6a.jpg"}/>


                                )
                            })}
                            hand2={this.state.hand2.map((card) => {
                                return(
                                    this.state.turn === 'player2' ?
                                        <img onClick={this.selectMonster.bind(this)} className="col-sm-1 player2 card"
                                             height="100" width="68" src={card.image_url}/> :
                                        <img alt="Hand 1" height="100" width="68"
                                             src={"https://i.pinimg.com/originals/ed/b7/02/edb702c8400d4b0c806d964380b03b6a.jpg"}/>
                                )
                            })}
                            monster_field1={this.state.monster_field1}
                            monster_slots1 = {this.state.monster_slots1}
                            monster_field2={this.state.monster_field2}
                            monster_slots2 = {this.state.monster_slots2}
                            spell_field1={this.state.spell_field1}
                            spell_slots1 = {this.state.spell_slots1}
                            spell_field2={this.state.spell_field2}
                            spell_slots2 = {this.state.spell_slots2}
                            main_phase1_2={this.mainPhase1And2.bind(this)}
                            select_sacrifices={this.selectSacrifices.bind(this)}
                            select_spell={this.selectSpell.bind(this)}
                        />
                    </div>

                    <div className="col-sm-3">
                        <h1>{winCondition ? <span>{this.state.winner} has won</span>: ""}</h1>
                        <h2>{this.state.turn} - Phase: {phase ? this.state.phase_name[this.state.phase] : this.state.phase_name[this.state.phase]}</h2>
                        <h3>Player 2 Lifepoints: {this.state.lifepoints2}</h3>
                        <ProgressBar active now={this.state.lifepoints2/8000*100} />
                        <h3>Player 1 Lifepoints: {this.state.lifepoints1}</h3>
                        <ProgressBar active now={this.state.lifepoints1/8000*100} />
                        <hr></hr>
                        <button className="btn btn-primary" onClick={this.endPhase.bind(this)}>End Phase</button>
                        {this.state.monster_selected && !this.state.selected_monster.spell_played && this.state.phase === 1
                        && this.state.spell_field1.length < 5 && this.state.selected_monster.card_type ==="Spell"
                        && this.state.turn === "player1"?
                            <span>
                                <button onClick={this.setSpell.bind(this)}>Set Spell</button>
                            </span>: ""
                        }
                        {this.state.monster_selected && !this.state.selected_monster.spell_played && this.state.phase === 1
                        && this.state.spell_field2.length < 5 && this.state.selected_monster.card_type ==="Spell"
                        && this.state.turn === "player2"?
                            <span>
                                <button onClick={this.setSpell.bind(this)}>Set Spell</button>
                            </span>: ""
                        }
                        {this.state.selected_spell.length != "" && (this.state.phase === 1 || this.state.phase === 3) ?
                            <button className="btn btn-danger" onClick={this.playSpell.bind(this)}>Play Spell</button> : ""
                        }
                        {this.state.monster_selected && !this.state.monster_played && this.state.phase === 1 &&
                        this.state.selected_monster.stars <= 4 && this.state.monster_field1.length < 5
                        && this.state.turn === "player1" && this.state.selected_monster.card_type ==="Monster" ?
                            <span>
                                <button className="btn btn-danger" onClick={this.playMonster.bind(this)}>Set Attack</button>
                                <button className="btn btn-success" onClick={this.playMonster.bind(this)}>Set Defense</button>
                            </span>: ""
                        }
                        {this.state.monster_selected && !this.state.monster_played && this.state.phase === 1 &&
                        this.state.selected_monster.stars <= 4 && this.state.monster_field2.length < 5
                        && this.state.turn === "player2" && this.state.selected_monster.card_type ==="Monster"?
                            <span>
                                <button className="btn btn-danger" onClick={this.playMonster.bind(this)}>Set Attack</button>
                                <button className="btn btn-success" onClick={this.playMonster.bind(this)}>Set Defense</button>
                            </span>: ""
                        }
                        {this.state.monster_selected && !this.state.monster_played && this.state.phase === 1 &&
                        this.state.selected_monster.stars > 4 && this.state.selected_monster.stars < 7
                        && this.state.selected_sacrifices.length === 1 && this.state.selected_monster.card_type ==="Monster"?
                            <span>
                                <button className="btn btn-danger" onClick={this.summonMonster.bind(this)}>Set Attack</button>
                                <button className="btn btn-success" onClick={this.summonMonster.bind(this)}>Set Defense</button>
                            </span>: ""
                        }
                        {this.state.monster_selected && !this.state.monster_played && this.state.phase === 1 &&
                        this.state.selected_monster.stars >= 7 && this.state.selected_sacrifices.length === 2
                        && this.state.selected_monster.card_type ==="Monster"?
                            <span>
                                <button className="btn btn-danger" onClick={this.summonMonster.bind(this)}>Sac 2 Set Attack</button>
                                <button className="btn btn-success" onClick={this.summonMonster.bind(this)}>Set Defense</button>
                            </span>: ""
                        }
                        {!this.state.selected_monster.has_changed_battle_position && !this.state.selected_monster.has_attacked
                        && this.state.phase === 3 && this.state.monster_selected
                        && this.state.selected_monster.position === 'defense'?
                            <span>
                            <button className="btn btn-danger" onClick={this.switchPosition.bind(this)}>Switch to Attack Mode MP2</button>
                        </span>: ""
                        }
                        {!this.state.selected_monster.has_changed_battle_position && !this.state.selected_monster.has_attacked
                        && this.state.phase === 3 && this.state.monster_selected
                        && this.state.selected_monster.position === 'attack'?
                            <span>
                            <button className="btn btn-success" onClick={this.switchPosition.bind(this)}>Switch to Defense Mode MP2</button>
                        </span>: ""
                        }
                        {attack_button ?
                            <span>
                            <button className="btn btn-danger" onClick={this.attack.bind(this)}>Attack</button>
                        </span> : ""
                        }
                    </div>

                    <div className="col-sm-3">
                        {this.state.selected_card ?
                            (<h3><div>{this.state.selected_card.card_name}</div>
                                <div>Attack: {this.state.selected_card.attack}</div>
                                <div>Defense: {this.state.selected_card.defense}</div>
                                <div>Stars: {this.state.selected_card.stars}</div>
                                <div>Description: <h4>{this.state.selected_card.description}</h4></div>
                                <img src={this.state.selected_card.image_url} height="291" width="200"/>
                            </h3>) : ""
                        }
                    </div>
                </div>
                    <div className="row">
                        <div className="col-sm-1">
                            <img onClick={this.drawCard.bind(this)} alt="Deck 1" height="100" width="68" src={"https://i.pinimg.com/originals/ed/b7/02/edb702c8400d4b0c806d964380b03b6a.jpg"}/>
                        </div>
                    </div>
                </div>
        )
    }
}

export default Game