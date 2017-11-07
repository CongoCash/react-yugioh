import axios from 'axios'

class DecksModel {
    static decks(){
        let request = axios.get("https://sleepy-forest-26880.herokuapp.com/api/decks.json")
        return request
    }

//     static post(post_id){
//         let request = axios.get(`http://localhost:8080/api/posts/${post_id}`)
//         return request
//     }
//
//     static comments(post_id) {
//         let request = axios.get(`http://localhost:8080/api/posts/${post_id}/comments`)
//         return request
//     }
//
//     static create(todo) {
//         let request = axios.post("http://localhost:8080/api/posts", todo)
//         return request
//     }
//
//     static delete(todo){
//         let request = axios.delete(`http://localhost:8080/api/posts/${todo._id}`)
//         return request
//     }
//
//     static update(todoId, todoBody) {
//         let request = axios.put(`http://localhost:8080/api/posts/${todoId}`, {
//             body: todoBody
//         })
//         return request
//     }
}

export default DecksModel