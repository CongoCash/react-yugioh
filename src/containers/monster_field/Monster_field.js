import React, { Component } from 'react'

class Monster_field extends Component {


    render() {
        return(
            <div className="row">
                    {this.props.monster_field}
                    {this.props.monster_slots}
            </div>
        )
    }
}

export default Monster_field