import axios from "axios";

const helper = () => {
    const API_ROUTE = 'https://excellently-preferred-human.cloudpub.ru/'
    const post = async (url, data) => {
        const res = await axios.post(API_ROUTE + url, data)
        return res.data
    }
    const remove = async (url, id) => {
        await axios.delete(API_ROUTE + url + '/' + id)
    }
    const get = async (url) => {
        const res = await axios.get(API_ROUTE + url)
        return res.data
    }
    const fetchAudio = async (url) => {
        const res = await axios.get(API_ROUTE + url, {
            responseType: 'blob' // Expecting a binary image file
        })
        return res.data
    }
    return {
        post,
        get,
        remove,
        fetchAudio
    };
}


export default helper