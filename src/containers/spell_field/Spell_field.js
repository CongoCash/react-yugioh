import React, { Component } from 'react'

class Spell_field extends Component {


    render() {
        return(
                    <div className="row">
                        <div className="col-sm-12">
                            {this.props.spell_field}
                            {this.props.spell_slots}
                            <img className="col-sm-1 card" height="100" width="60" src="http://img4.wikia.nocookie.net/__cb20080808215742/yugioh/images/2/27/GraveyardZone5DS1.png"/>
                        </div>
                    </div>
        )
    }
}

export default Spell_field