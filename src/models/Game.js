import axios from 'axios'

class GamesModel {

    static all(){
        let request = axios.get("https://sleepy-forest-26880.herokuapp.com/api/games.json")
        return request
    }

    static specific(id){
        let request = axios.get("https://sleepy-forest-26880.herokuapp.com/api/games/" + id + ".json")
        return request
    }

    static create(){
        let request = axios.post("https://sleepy-forest-26880.herokuapp.com/api/games")
        return request
    }

    static destroy(id) {
        let request = axios.delete("https://sleepy-forest-26880.herokuapp.com/api/games/" + id)
        return request
    }

}

export default GamesModel