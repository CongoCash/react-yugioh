import React, { Component } from 'react'
import './Hand.css';

class Hand extends Component {
    render() {
        return(
            <div className="row cardjjjj">
                    {this.props.hand}
            </div>
        )
    }
}

export default Hand