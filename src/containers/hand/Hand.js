import React, { Component } from 'react'
import './Hand.css';

class Hand extends Component {



    render() {
        return(
            <div className="row cardjjjj">
                <div className="col-sm-12">
                    {this.props.hand}
                </div>
            </div>
        )
    }
}

export default Hand