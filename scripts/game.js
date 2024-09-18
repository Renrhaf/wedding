// Game javascript code
$(document).ready(function() {
  AOS.init({});

  // Configure airtable
  const Airtable = require('airtable');
  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: atob(eval(atob('JChhdG9iKCdJMkYwYVdRPScpKS5hdHRyKGF0b2IoJ1pHRjBZUzFoZEhSeUxXRjBhV1E9Jykp'))),
  });

  // Initialize the base
  const base = Airtable.base('appJshxpUksuHpFEq');

  // Initialize the game
  initializeGame();

  /**
   * Initialize the game.
   */
  function initializeGame() {
    // Display loading.
    $('#game-form-message').html('Veuillez patienter...').show();
    $('#game-form-result').hide();
    $('.ww-game-submit-hide').hide();
    $('.ww-game-form-reset').hide();

    // Make sure the QR code was scanned properly.
    const urlParams = new URLSearchParams(window.location.search);
    let targetIdentifier = urlParams.get('identifier');
    if (targetIdentifier === null || targetIdentifier === undefined) {
        $('#game-form-result').html('🐛 Désolé, il y a une erreur dans les données, contactez le développeur.').show();
        $('#game-form-message').html('').hide();
        $('.ww-game-submit-hide').hide();
        console.log("ERROR: ", err);
    }

    // Make sure the target exists
    targetIdentifier = parseInt(targetIdentifier);
    getPlayerByIdentifier(targetIdentifier)
        .then((record)=> {
          $('#target-input').val(record.get('Name')).show();
          $('#game-form-message').html('').hide();
          $('.ww-game-submit-hide').show();
        })
        .catch((err)=> {
          $('#game-form-result').html('🐛 Désolé, il y a une erreur dans les données, contactez le développeur.').show();
          $('#game-form-message').html('').hide();
          $('.ww-game-submit-hide').hide();
          console.log("ERROR: ", err);
        });

    // Form reset
    $('#game-form-reset').on('click', (e) => {
      $('#game-form-message').html('').hide();
      $('#game-form-result').hide();
      $('.ww-game-form-reset').hide();
      $('.ww-game-submit-hide').show();

      e.preventDefault();
      return false;
    });

    // Override form submit
    $('#game-form').on('submit', (e) => {
      // Get the identifier of the player
      const enteredIdentifier = parseInt($('#secret-code-input').val());
      $('#game-form-message').html('Veuillez patienter...').show();
      $('#game-form-result').hide();
      $('.ww-game-submit-hide').hide();
      $('.ww-game-form-reset').hide();

      // Fetch its information
      getPlayerByIdentifier(enteredIdentifier)
          .then((record)=> {
            let player = record;
            if (player === null || player === undefined) {
              $('#game-form-result').html('🤥 Ce code secret n\'existe pas !').show();
              $('#game-form-message').html('').hide();
              $('.ww-game-form-reset').show();

              return;
            }

            // Check if the player has already won
            const playerStatus = player.get('Statut mission');
            if (playerStatus) {
              $('#game-form-result').html('Vous avez déjà accompli votre mission<br/>🍸 Allez donc vous prendre un verre !').show();
              $('#game-form-message').html('').hide();
              $('.ww-game-form-reset').show();

              return;
            }

            // Make sure there is one target
            const playerTargets = player.get('Cible');
            if (playerTargets === undefined || playerTargets === null || playerTargets.length === 0 || playerTargets.length > 1) {
              $('#game-form-result').html('🐛 Désolé, il y a une erreur dans les données, contactez le développeur.').show();
              $('#game-form-message').html('').hide();
              $('.ww-game-form-reset').show();

              return;
            }

            // Get info about the target player
            const playerTargetId = playerTargets[0];
            getPlayer(playerTargetId)
                .then((record)=> {
                  const playerTarget = record;
                  if (playerTarget === null || playerTarget === undefined) {
                    $('#game-form-result').html('🐛 Désolé, il y a une erreur dans les données, contactez le développeur.').show();
                    $('#game-form-message').html('').hide();
                    $('.ww-game-form-reset').show();

                    return;
                  }

                  // Check if the two identifiers match
                  const playerTargetIdentifier = playerTarget.get('ID');
                  if (playerTargetIdentifier === targetIdentifier) {
                    // Increment player try count, set status to success
                    // and show a success message
                    incrementPlayerTryCountSuccess(player)
                        .then((record)=> {
                          player = record;
                          const tentatives = record.get('Tentatives');

                          if (tentatives === 1) {
                            $('#game-form-result').html('👏 Bravo '+player.get('Name')+', vous avez trouvé votre cible du premier coup, c\'était bien '+playerTarget.get('Name')+' !').show();
                          } else if (tentatives <= 3) {
                            $('#game-form-result').html('💪 Bien joué '+player.get('Name')+', vous avez trouvé votre cible après '+tentatives+' tentatives, c\'était bien '+playerTarget.get('Name')+' ! ').show();
                          } else if (tentatives <= 6) {
                            $('#game-form-result').html('👍 Pas mal '+player.get('Name')+', vous avez enfin trouvé votre cible après '+tentatives+' tentatives, c\'était bien '+playerTarget.get('Name')+' ! ').show();
                          } else {
                            $('#game-form-result').html('👀 C\'était laborieux '+player.get('Name')+', mais vous avez enfin trouvé votre cible après '+tentatives+' tentatives, c\'était bien '+playerTarget.get('Name')+' ! ').show();
                          }

                          $('#game-form-message').html('').hide();
                          $('.ww-game-form-reset').show();
                        })
                        .catch((err)=> {
                          $('#game-form-result').html('🐛 Désolé, il y a une erreur dans les données, contactez le développeur.').show();
                          $('#game-form-message').html('').hide();
                          $('.ww-game-form-reset').show();

                          console.log("ERROR: ", err);
                        });

                  } else {
                    // Increment the player try count
                    // and show a failure message
                    incrementPlayerTryCount(player)
                        .then((record)=> {
                          player = record;
                          const tentatives = record.get('Tentatives');

                          if (tentatives > 1) {
                              $('#game-form-result').html('😟 Désolé '+player.get('Name')+', vous vous êtes trompé(e) de cible pour la '+tentatives+' fois !<br/>Ne baissez pas les bras !').show();
                          } else {
                              $('#game-form-result').html('🤔 Désolé '+player.get('Name')+', vous vous êtes trompé(e) de cible<br/>Continuez à chercher...').show();
                          }

                          $('#game-form-message').html('').hide();
                          $('.ww-game-form-reset').show();
                        })
                        .catch((err)=> {
                          $('#game-form-result').html('🐛 Désolé, il y a une erreur dans les données, contactez le développeur.').show();
                          $('#game-form-message').html('').hide();
                          $('.ww-game-form-reset').show();

                          console.log("ERROR: ", err);
                        });
                  }
                })
                .catch((err)=> {
                  $('#game-form-result').html('🐛 Désolé, il y a une erreur dans les données, contactez le développeur.').show();
                  $('#game-form-message').html('').hide();
                  $('.ww-game-form-reset').show();

                  console.log("ERROR: ", err);
                });
          })
          .catch((err)=> {
            $('#game-form-result').html('🐛 Désolé, il y a une erreur dans les données, contactez le développeur.').show();
            $('#game-form-message').html('').hide();
            $('.ww-game-form-reset').show();

            console.log("ERROR: ", err);
          });

      e.preventDefault();
      return false;
    });
  }

  /**
   * Get a player.
   *
   * @param identifier
   *
   * @returns record
   */
  async function getPlayer(identifier) {
    return await base('Game').find(identifier);
  }

  /**
   * Get a player by identifier.
   *
   * @param identifier
   *
   * @returns record
   */
  async function getPlayerByIdentifier(identifier) {
    let player = null;

    const records = await base('Game').select({filterByFormula: 'ID = ' + identifier}).all();
    records.forEach(function(record) {
      player = record;
    });

    return player;
  }

  /**
   * Get all the players.
   *
   * @returns array
   */
  async function getAllPlayers() {
    let players = [];
    const records = await base('Game').select().all();
    records.forEach(function(record) {
      players.push(record);
    });

    return players;
  }

  /**
   * Increment a player try count.
   *
   * @param record
   *
   * @returns record
   */
  async function incrementPlayerTryCount(record) {
    return await base('Game').update(record.id, {
      "Tentatives": record.get('Tentatives') + 1,
    });
  }

  /**
   * Increment a player try count and set status to checked.
   *
   * @param record
   *
   * @returns record
   */
  async function incrementPlayerTryCountSuccess(record) {
    return await base('Game').update(record.id, {
      "Tentatives": record.get('Tentatives') + 1,
      "Statut mission": true,
      "Date de fin de mission": new Date(),
    });
  }

});