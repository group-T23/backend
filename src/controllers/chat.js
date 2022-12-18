const mongoose = require('mongoose')
const Chat = require('../models/Chat');
const Buyer = require('../models/Buyer');
const Message = require('../models/Message');

const getChat = async(req, res) => {
    const username = req.query.username;
    if (!username) { res.status(400).json({ code: 802, message: 'Username argument is missing' }); return }

    const result = await Buyer.findOne({ username: username });
    if (!result) res.status(404).json({ code: 803, message: 'User not found' });
    else res.status(200).json({ code: 800, message: 'Success', chats: result.chats });
}

const createChat = async(req, res) => {
    const username = req.query.username;
    if (!username) { res.status(400).json({ code: 802, message: 'Username argument is missing' }); return }

    const contactUsername = req.body.contact;
    if (!contactUsername) { res.status(400).json({ code: 802, message: 'Contact property is missing' }); return }
    if (username == contactUsername) { res.status(400).json({ code: 806, message: 'Contact can not coincide with the username' }); return }

    const contact = await Buyer.findOne({ username: contactUsername });
    if (!contact) { res.status(404).json({ code: 804, message: 'The provided contact does not exist' }); return }

    const user = await Buyer.findOne({ username: username });
    if (!user) { res.status(404).json({ code: 805, message: 'The provided user does not exist' }); return }

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

        chat.save((err, data) => {
            if (err) { res.status(500).json({ code: 801, message: 'Database error' }); return }
        });
    }

    res.status(200).json({ code: 800, message: 'Chat created successfully' });
}

const deleteChat = async(req, res) => {
    const username = req.query.username;
    if (!username) { res.status(400).json({ code: 802, message: 'Username argument is missing' }); return }

    const contactUsername = req.body.contact;
    if (!contactUsername) { res.status(400).json({ code: 802, message: 'Contact property is missing' }); return }
    if (username == contactUsername) { res.status(400).json({ code: 806, message: 'Contact can not coincide with the username' }); return }

    const contact = await Buyer.findOne({ username: contactUsername });
    if (!contact) { res.status(404).json({ code: 804, message: 'The provided contact does not exist' }); return }

    const user = await Buyer.findOne({ username: username });
    if (!user) { res.status(404).json({ code: 805, message: 'The provided user does not exist' }); return }

    const Id = mongoose.Types.ObjectId;
    const chat = await Chat.findOne({
        $or: [
            { $and: [{ user1: { id: new Id(user.id) } }, { user2: { id: new Id(contact.id) } }] },
            { $and: [{ user1: { id: new Id(contact.id) } }, { user2: { id: new Id(user.id) } }] }
        ]
    })

    if (!chat) res.status(404).json({ code: 807, message: 'Chat not found' });
    else await Message.deleteMany({ _id: { $in: chat.messages.map(message => new Id(message.id)) } });

    Chat.deleteOne({
        $or: [
            { $and: [{ user1: { id: new Id(user.id) } }, { user2: { id: new Id(contact.id) } }] },
            { $and: [{ user1: { id: new Id(contact.id) } }, { user2: { id: new Id(user.id) } }] }
        ]
    }, (err, data) => {
        if (err) res.status(500).json({ code: 801, message: 'Database error' });
        else res.status(200).json({ code: 800, message: 'Chat deleted successfully' });
    });
}

const getMessage = async(req, res) => {
    const username = req.query.username;
    if (!username) { res.status(400).json({ code: 802, message: 'Username argument is missing' }); return }

    const contactUsername = req.query.contact;
    if (!contactUsername) { res.status(400).json({ code: 802, message: 'Contact property is missing' }); return }
    if (username == contactUsername) { res.status(400).json({ code: 806, message: 'Contact can not coincide with the username' }); return }

    const contact = await Buyer.findOne({ username: contactUsername });
    if (!contact) { res.status(404).json({ code: 804, message: 'The provided contact does not exist' }); return }

    const user = await Buyer.findOne({ username: username });
    if (!user) { res.status(404).json({ code: 805, message: 'The provided user does not exist' }); return }

    const Id = mongoose.Types.ObjectId;
    const chat = await Chat.findOne({
        $or: [
            { $and: [{ user1: { id: new Id(user.id) } }, { user2: { id: new Id(contact.id) } }] },
            { $and: [{ user1: { id: new Id(contact.id) } }, { user2: { id: new Id(user.id) } }] }
        ]
    });

    if (!chat) { res.status(404).json({ code: 807, message: 'Chat not found' }); return }

    const result = await Message.find({ id: { $in: [chat.messages.map(message => Id(message.id))] } })
    res.status(200).json({ code: 800, message: 'Success', messages: result });
}

// Supports only text messages at the moment
const sendMessage = async(req, res) => {
    const username = req.query.username;
    if (!username) { res.status(400).json({ code: 802, message: 'Username argument is missing' }); return }

    const contactUsername = req.body.contact;
    if (!contactUsername) { res.status(400).json({ code: 802, message: 'Contact property is missing' }); return }
    const messageText = req.body.message;
    if (!messageText) { res.status(400).json({ code: 802, message: 'Message property is missing' }); return }
    if (username == contactUsername) { res.status(400).json({ code: 806, message: 'Contact can not coincide with the username' }); return }

    const contact = await Buyer.findOne({ username: contactUsername });
    if (!contact) { res.status(404).json({ code: 804, message: 'The provided contact does not exist' }); return }

    const user = await Buyer.findOne({ username: username });
    if (!user) { res.status(404).json({ code: 805, message: 'The provided user does not exist' }); return }

    const Id = mongoose.Types.ObjectId;
    const chat = await Chat.findOne({
        $or: [
            { $and: [{ user1: { id: new Id(user.id) } }, { user2: { id: new Id(contact.id) } }] },
            { $and: [{ user1: { id: new Id(contact.id) } }, { user2: { id: new Id(user.id) } }] }
        ]
    });

    if (!chat) { res.status(404).json({ code: 807, message: 'Chat not found' }); return }
    const message = new Message({
        sender: { id: new Id(user.id) },
        text: messageText
    });

    message.save((err, data) => {
        if (err) { res.status(500).json({ code: 801, message: 'Database error' }); return }
    });

    chat.messages.push({ id: new Id(message._id) });
    chat.save();

    res.status(200).json({ code: 800, message: 'Message sent successfully' });
}

module.exports = { getChat, createChat, deleteChat, getMessage, sendMessage };