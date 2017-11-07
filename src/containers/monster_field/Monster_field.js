import React, { Component } from 'react'

class Monster_field extends Component {


    render() {
        return(
            <div className="row">
                <div className="col-sm-12">
                    {this.props.monster_field}
                    {this.props.monster_slots}
                </div>
            </div>
        )
    }
}

export default Monster_field