import axios from 'axios'

class DecksModel {
    static decks(){
        let request = axios.get("https://sleepy-forest-26880.herokuapp.com/api/decks.json")
        return request
    }
}

export default DecksModel