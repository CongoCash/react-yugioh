import axios from 'axios'

class CardsModel {

    static cards(){
        let request = axios.get("https://sleepy-forest-26880.herokuapp.com/api/cards.json")
        return request
    }

}

export default CardsModel