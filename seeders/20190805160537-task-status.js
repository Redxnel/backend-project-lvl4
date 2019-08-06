module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TaskStatuses', [{
    name: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {}),

  down: queryInterface => queryInterface.bulkDelete('TaskStatuses', null, {}),
};
