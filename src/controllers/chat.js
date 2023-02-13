const mongoose = require('mongoose')
const Chat = require('../models/Chat');
const Buyer = require('../models/Buyer');
const Message = require('../models/Message');
const { getAuthenticatedUser } = require('../utils/auth');

const getChat = async(req, res) => {
    let user = await getAuthenticatedUser(req, res);

    const username = req.query.username;
    if (!username) { res.status(400).json({ code: '1102', message: 'Missing Arguments' }); return }

    const result = await Buyer.findOne({ username: username });
    if (!result) {res.status(404).json({ code: '1104', message: 'User Not Found' }); return;};
    let idUser = result._id;

    //ricerca all'interno della collection Chat 
    let result2;
    if(username != user.username){
        result2 = await Chat.find({
            "$or": [
                {
                    $and: [
                        { "user1.id": idUser }, { "user2.id": user._id }
                ]
            },
            {
                $and: [
                    { "user1.id": user._id }, { "user2.id": idUser }
                ]
            },
            ]
        });
    }
    //ricerca contatti 
    if(username == user.username){
        result2 =  await Chat.find({
            "$or": [
                { "user1.id": user._id }, { "user2.id": user._id }
            ]
        });
    }

    res.status(200).json({ code: '1100', message: 'Success', chats: result2 });
}

const createChat = async(req, res) => {
    const username = req.query.username;
    if (!username) { res.status(400).json({ code: '1102', message: 'Missing Arguments' }); return }

    const contactUsername = req.body.contact;
    if (!contactUsername) { res.status(400).json({ code: '1102', message: 'Missing Arguments' }); return }
    if (username == contactUsername) { res.status(400).json({ code: '1108', message: 'Contact Not Match Username' }); return }

    const contact = await Buyer.findOne({ username: contactUsername });
    if (!contact) { res.status(404).json({ code: '1105', message: 'Contact Not Found' }); return }

    const user = await Buyer.findOne({ username: username });
    if (!user) { res.status(404).json({ code: '1103', message: 'Invalid Arguments' }); return }

    const Id = mongoose.Types.ObjectId;
    const checkChat = await Chat.findOne({
        $or: [
            { $and: [{ user1: { id: new Id(user.id) } }, { user2: { id: new Id(contact.id) } }] },
            { $and: [{ user1: { id: new Id(contact.id) } }, { user2: { id: new Id(user.id) } }] }
        ]
    });

    if (!checkChat) {
        const chat = new Chat({
            user1: { id: user.id },
            user2: { id: contact.id },
        });

        await chat.save().catch(err => console.log(err))
    }

    res.status(200).json({ code: '1100', message: 'Success' });
}

const deleteChat = async(req, res) => {
    const username = req.query.username;
    if (!username) { res.status(400).json({ code: '1102', message: 'Missing arguments' }); return }

    const contactUsername = req.body.contact;
    if (!contactUsername) { res.status(400).json({ code: '1102', message: 'Missing arguments' }); return }
    if (username == contactUsername) { res.status(400).json({ code: '1107', message: 'Contact Not Match Username' }); return }

    const contact = await Buyer.findOne({ username: contactUsername });
    if (!contact) { res.status(404).json({ code: '1103', message: 'Invalid Arguments' }); return }

    const user = await Buyer.findOne({ username: username });
    if (!user) { res.status(404).json({ code: '1103', message: 'Invalid Arguments' }); return }

    const Id = mongoose.Types.ObjectId;
    const chat = await Chat.findOne({
        $or: [
            { $and: [{ user1: { id: new Id(user.id) } }, { user2: { id: new Id(contact.id) } }] },
            { $and: [{ user1: { id: new Id(contact.id) } }, { user2: { id: new Id(user.id) } }] }
        ]
    })

    if (!chat) res.status(404).json({ code: '1106', message: 'Chat Not Found' });
    else await Message.deleteMany({ _id: { $in: chat.messages.map(message => new Id(message.id)) } });

    Chat.deleteOne({
        $or: [
            { $and: [{ user1: { id: new Id(user.id) } }, { user2: { id: new Id(contact.id) } }] },
            { $and: [{ user1: { id: new Id(contact.id) } }, { user2: { id: new Id(user.id) } }] }
        ]
    }, (err, data) => {
        if (err) res.status(500).json({ code: '1101', message: 'Database Error' });
        else res.status(200).json({ code: '1100', message: 'Sucess' });
    });
}

const getMessage = async(req, res) => {
    const username = req.query.username;
    if (!username) { res.status(400).json({ code: '1102', message: 'Missing Arguments' }); return }

    const contactUsername = req.query.contact;
    if (!contactUsername) { res.status(400).json({ code: '1102', message: 'Missing Arguments' }); return }
    if (username == contactUsername) { res.status(400).json({ code: '1107', message: 'Contact Not Match Username' }); return }

    const contact = await Buyer.findOne({ username: contactUsername });
    if (!contact) { res.status(404).json({ code: '1103', message: 'Invalid Arguments' }); return }

    const user = await Buyer.findOne({ username: username });
    if (!user) { res.status(404).json({ code: '1103', message: 'Invalid Arguments' }); return }

    const Id = mongoose.Types.ObjectId;
    const chat = await Chat.findOne({
        $or: [
            { $and: [{ user1: { id: new Id(user.id) } }, { user2: { id: new Id(contact.id) } }] },
            { $and: [{ user1: { id: new Id(contact.id) } }, { user2: { id: new Id(user.id) } }] }
        ]
    });

    if (!chat) { res.status(404).json({ code: '1106', message: 'Chat Not Found' }); return }

    const result = await Message.find({ id: { $in: [chat.messages.map(message => Id(message.id))] } })
    res.status(200).json({ code: '1100', message: 'Success', messages: result });
}

const getMessageById = async(req, res) => {
    const id = req.query.id;

    if (!id) { res.status(400).json({ code: '1102', message: 'Missing Arguments' }); return }

    const message = await Message.findById(id);

    if (!message) { res.status(404).json({ code: '1107', message: 'Message Not Found' }); return }

    res.status(200).json({ code: '1100', message: 'Success', message: message });
}

// Supports only text messages at the moment
const sendMessage = async(req, res) => {
    const username = req.query.username;
    if (!username) { res.status(400).json({ code: '1102', message: 'Missing Arguments' }); return }

    const contactUsername = req.body.contact;
    if (!contactUsername) { res.status(400).json({ code: '1102', message: 'Missing Arguments' }); return }
    const messageText = req.body.message;

    if (!messageText) { res.status(400).json({ code: '1102', message: 'Missing Arguments' }); return }
    if (username == contactUsername) { res.status(400).json({ code: '1108', message: 'Contact Not Match Username' }); return }

    const contact = await Buyer.findOne({ username: contactUsername });
    if (!contact) { res.status(404).json({ code: '1103', message: 'Invalid Arguments' }); return }

    const user = await Buyer.findOne({ username: username });
    if (!user) { res.status(404).json({ code: '1103', message: 'Invalid Arguments' }); return }

    const Id = mongoose.Types.ObjectId;

    const chat = await Chat.findOne({
        $or: [
            { $and: [{ user1: { id: new Id(user.id) } }, { user2: { id: new Id(contact.id) } }] },
            { $and: [{ user1: { id: new Id(contact.id) } }, { user2: { id: new Id(user.id) } }] }
        ]
    });

    if (!chat) { res.status(404).json({ code: '1106', message: 'Chat Not Found' }); return }
    const message = new Message({
        sender: { id: new Id(user.id) },
        text: messageText
    });

    await message.save().catch(err => console.log(err))

    //update chat con inserimento nuovo messaggio   
    const result = await Chat.updateOne({
        $or: [
            { $and: [{ user1: { id: new Id(user.id) } }, { user2: { id: new Id(contact.id) } }] },
            { $and: [{ user1: { id: new Id(contact.id) } }, { user2: { id: new Id(user.id) } }] }
        ]
    }, { $push: { "messages": { id: new Id(message._id) } } })

    res.status(200).json({ code: '1100', message: 'Success' });
}

module.exports = { getChat, createChat, deleteChat, getMessage, getMessageById, sendMessage };