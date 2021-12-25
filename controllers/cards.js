const { ERROR_DEFAULT, ERROR_INCORRECT_VALUE, ERROR_NOT_FOUND } = require('../constants');

const Card = require('../models/card');

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  // записываем данные в базу
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_INCORRECT_VALUE).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' });
      }
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(ERROR_DEFAULT).send({ message: 'Произошла ошибка' }));
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      card.deleteOne();
      res.send({ data: card });
    })
    .orFail(() => {
      throw new Error('NotFound');
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        res.status(ERROR_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
      }
    });
};

module.exports.likeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
  { new: true },
)
  .then((like) => res.send({ data: like }))
  .orFail(() => {
    throw new Error('NotFound');
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      res.status(ERROR_INCORRECT_VALUE).send({ message: 'Переданы некорректные данные для постановки лайка' });
    }
    if (err.message === 'NotFound') {
      res.status(ERROR_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
    } else {
      res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' });
    }
  });

module.exports.dislikeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
)
  .then((like) => res.send({ data: like }))
  .onFail(() => {
    throw new Error('NotFound');
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      res.status(ERROR_INCORRECT_VALUE).send({ message: 'Переданы некорректные данные для снятия лайка' });
    }
    if (err.message === 'NotFound') {
      res.status(ERROR_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
    } else {
      res.status(ERROR_DEFAULT).send({ message: 'Ошибка по умолчанию' });
    }
  });
