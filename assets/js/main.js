$(document).ready(function() {
    let musicLibrary = [];

    let playlist = [];
    
    const cardContainer = $('#cardsContainer');
    
    // Função para criar os cards
    function loadLibrary() {
        cardContainer.html('');
        
        if (musicLibrary.length === 0) {
            cardContainer.append('<p class="d-flex justify-content-center align-items-center mb-1 pb-1 pt-2" style="color: white;">Nenhuma faixa adicionada. Adicione clicando em "Adicionar nova faixa".</p>');
        } else {
            musicLibrary.forEach(function(music) {
                const isInPlaylist = playlist.some(item => item.id === music.id);
                const addButtonHtml = isInPlaylist ? '<i class="bi bi-bookmark-check-fill"></i>' : '<i class="bi bi-bookmark"></i>';
                const addButtonDisabled = isInPlaylist ? 'disabled' : '';
                
                cardContainer.append(
                    `<div class="card d-flex flex-column align-items-center" id="${music.id}">
                        <img src="${music.coverUrl}" class="card-img-top" alt="Capa do disco">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div class="data-music">
                                <h5 class="card-title">${music.songName}</h5>
                                <p class="card-text">${music.albumName}</p>
                                <p class="card-text">${music.artist}</p>
                            </div>
                            <div class="btns-card d-flex align-items-center justify-content-between gap-2">
                                <button class="btn addSong" ${addButtonDisabled}>${addButtonHtml}</button>
                                <button class="btn btn-outline-primary editButtonCard"><i class="bi bi-pencil-square"></i></button>
                                <button class="btn btn-outline-danger removeButtonCard"><i class="bi bi-trash"></i></button>
                            </div>
                        </div>
                    </div>`
                );
            });
        }
    }
    
    $(document).on('click', '.deleteSong', function() {
        const songId = $(this).closest('.card').attr('id');
        removeSong(songId);
    });

    function removeSong(songId) {
        musicLibrary = musicLibrary.filter(song => song.id !== songId);
        saveMusicLibraryToLocalStorage(); // Salva a lista atualizada no localStorage
        loadLibrary(); // Atualiza a exibição da biblioteca de músicas
    }

    const buildPlaylist = $('#list-playlist');

    // Função para criar a lista do modal
    function loadPlaylist() {
        buildPlaylist.html('');
    
        if (playlist.length === 0) {
            buildPlaylist.append('<li class="d-flex justify-content-center align-items-center mb-1 pb-1 pt-2">Sua playlist está vazia ou nenhuma faixa foi adicionada ainda.</li>');
        } else {
            for (let index = 0; index < playlist.length; index++) {
                const song = playlist[index];
                buildPlaylist.append(
                    `<li class="d-flex justify-content-between align-items-center mb-1 pb-1" id="${song.id}">
                        ${song.songName} - ${song.artist}
                        <button type="button" class="btn btn-outline-danger removeButtonPlaylist"><i class="bi bi-trash"></i></button>
                    </li>`
                );
    
                // Desabilita o botão de adicionar correspondente na biblioteca de músicas
                $(`#${song.id} .addSong`).prop('disabled', true).html('<i class="bi bi-bookmark-check-fill"></i>');
            }
        }
    
        $(document).on('click', '.removeButtonCard', function() {
            const songId = $(this).closest('.card').attr('id');
            removeSong(songId);
        });
    }

    // Função para adicionar a música do modal
    function addToPlaylist(songId) {
        const songToAdd = musicLibrary.find(song => song.id === songId);
        if (songToAdd) {
            playlist.push(songToAdd);
            savePlaylistToLocalStorage(); // Salvar a playlist no localStorage
            loadPlaylist(); // Atualizar a exibição da playlist
            $(`#${songId} .addSong`).prop('disabled', true).html('<i class="bi bi-bookmark-check-fill"></i>');
        }
    }

    // Carregar a Playlist do LocalStorage
    function loadPlaylistFromLocalStorage() {
        const storedPlaylist = JSON.parse(localStorage.getItem('playlist'));
        if (storedPlaylist) {
            playlist = storedPlaylist;
            loadPlaylist(); // Atualizar a exibição da playlist após carregar do localStorage
        }
    }

    function savePlaylistToLocalStorage() {
        localStorage.setItem('playlist', JSON.stringify(playlist));
    }

    // Adiciona a música a playlist
    $(document).on('click', '.addSong', function() {
        const songId = $(this).closest('.card').attr('id');
        addToPlaylist(songId);
        // Desativa o botão após clicar
        $(this).prop('disabled', true).html('<i class="bi bi-bookmark-check-fill"></i>');
    });

    function removeFromPlaylist(songId) {
        playlist = playlist.filter(song => song.id !== songId);
        $('#' + songId).remove(); // Remove o item da playlist visualmente
        savePlaylistToLocalStorage(); // Salva a playlist atualizada no localStorage
        loadPlaylist(); // Atualizar a exibição da playlist
        $(`#${songId} .addSong`).prop('disabled', false).html('<i class="bi bi-bookmark"></i>');
    }

    $(document).on('click', '.removeButtonPlaylist', function() {
        const songId = $(this).closest('li').attr('id');
        removeFromPlaylist(songId);
    });

    function removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    
    function performFilter() {
        const searchFilter = removeAccents($('#search-filter').val().toLowerCase().trim()); // Remove acentos e converte para minúsculas
    
        if (searchFilter === '') {
            // Se o termo de busca estiver vazio, exibe a biblioteca de músicas completa
            renderLibrary(musicLibrary);
        } else {
            const filteredMusicLibrary = musicLibrary.filter(music => {
                // Remove acentos dos campos relevantes e converte para minúsculas, depois verifica se o termo de busca está contido neles
                return removeAccents(music.songName.toLowerCase()).includes(searchFilter) ||
                    removeAccents(music.artist.toLowerCase()).includes(searchFilter) ||
                    removeAccents(music.albumName.toLowerCase()).includes(searchFilter);
            });
    
            // Atualiza a exibição da biblioteca de músicas com os resultados filtrados
            renderLibrary(filteredMusicLibrary);
        }
    }

    // Evento de mudança no conteúdo do campo de busca
    $('#search-filter').on('input', performFilter);
    
    // Função para renderizar a biblioteca de músicas com base nos resultados filtrados
    function renderLibrary(filteredMusicLibrary) {
        cardContainer.html(''); // Limpa o conteúdo atual
        
        if (filteredMusicLibrary.length === 0) {
            cardContainer.append('<p class="d-flex justify-content-center align-items-center mb-1 pb-1 pt-2" style="color: white;">Nenhuma faixa encontrada. Filtre por nome da música, artista, ou álbum!</p>');
        } else {
            filteredMusicLibrary.forEach(function(music) {
                cardContainer.append(
                    `<div class="card d-flex flex-column align-items-center" id="${music.id}">
                        <img src="${music.coverUrl}" class="card-img-top" alt="Capa do disco">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div class="data-music">
                                <h5 class="card-title">${music.songName}</h5>
                                <p class="card-text">${music.albumName}</p>
                                <p class="card-text">${music.artist}</p>
                            </div>
                            <div class="btns-card d-flex align-items-center justify-content-between gap-2">
                                <button class="btn addSong"><i class="bi bi-bookmark"></i></button>
                                <button class="btn btn-outline-primary editButtonCard"><i class="bi bi-pencil-square"></i></button>
                                <button class="btn btn-outline-danger removeButtonCard"><i class="bi bi-trash"></i></button>
                            </div>
                        </div>
                    </div>`
                );
            });
        }
    }
    
    // Função para carregar a lista de músicas do armazenamento local
    function loadMusicLibraryFromLocalStorage() {
        const storedMusicLibrary = JSON.parse(localStorage.getItem('musicLibrary'));
        if (storedMusicLibrary) {
            musicLibrary = storedMusicLibrary;
            loadLibrary(); // Chame a função loadLibrary para exibir os cards após carregar os dados do localStorage
        }
    }

    // Função para salvar a lista de músicas no armazenamento local
    function saveMusicLibraryToLocalStorage() {
        localStorage.setItem('musicLibrary', JSON.stringify(musicLibrary));
    }

    let currentAudioFileName = ''; // Variável para armazenar o nome do arquivo .mp3 atual

    // Adiciona evento de clique para o botão de escolher novo arquivo .mp3
    $('#chooseAudioFileBtn').click(function() {
        // Define o diretório inicial para o seletor de arquivos
        $('#audioFile').attr('directory', './assets/audio');
        // Aciona o clique no campo de arquivo de áudio para abrir o seletor de arquivos
        $('#audioFile').click();
    });

    // Adiciona evento para quando um novo arquivo .mp3 for selecionado
    $('#audioFile').change(function() {
        const fileName = $(this).prop('files')[0].name;
        $('#audioFileName').text(fileName);
        currentAudioFileName = fileName; // Atualiza o nome do arquivo atual
    });

    // Função para adicionar ou editar música
    function addOrEditMusic(isEdit, cardId) {
        // Obter valores do formulário
        const songName = $('#songName').val();
        const artist = $('#artist').val();
        const albumName = $('#albumName').val();
        let coverUrl = $('#coverUrl').val(); // Obtenha a URL da capa do álbum
        
        // Verifica se a coverUrl está vazia e define a imagem padrão se estiver
        if (!coverUrl) {
            coverUrl = 'https://static.wixstatic.com/media/e4256a_08ecd1c0638b418cb33cbd99e6e3d76b~mv2.png';
        } else {
            // Verifica se o link do coverUrl termina com uma extensão de imagem válida
            const imageExtensions = /\.(jpeg|jpg|webp|gif|png)$/i;
            if (!coverUrl.match(imageExtensions)) {
                // Se o link não terminar com uma extensão de imagem válida, definir a imagem padrão
                coverUrl = 'https://static.wixstatic.com/media/e4256a_08ecd1c0638b418cb33cbd99e6e3d76b~mv2.png';
            }
        }

        let audioFileName = ''; // Variável para armazenar o nome do arquivo .mp3

        // Verifica se um novo arquivo .mp3 foi selecionado
        if ($('#audioFile').prop('files').length > 0) {
            audioFileName = $('#audioFile').prop('files')[0].name; // Obtém o nome do novo arquivo .mp3
        } else {
            audioFileName = currentAudioFileName; // Mantém o nome do arquivo atual
        }

        // Se for edição, atualiza a música existente na biblioteca
        if (isEdit) {
            const index = musicLibrary.findIndex(song => song.id === cardId);
            if (index !== -1) {
                musicLibrary[index].songName = songName;
                musicLibrary[index].artist = artist;
                musicLibrary[index].albumName = albumName;
                musicLibrary[index].coverUrl = coverUrl;
                musicLibrary[index].audioFile = audioFileName; // Atualiza o nome do arquivo .mp3
            }
        } else {
            // Se for adição, cria um novo objeto de música
            const newMusic = {
                id: (musicLibrary.length + 1).toString(), // Define o ID com base na posição atual do array
                songName: songName,
                artist: artist,
                albumName: albumName,
                coverUrl: coverUrl, // Inclua a URL da capa do álbum no objeto de música
                audioFile: audioFileName // Adiciona o nome do arquivo .mp3 ao objeto de música
            };
        
            // Adicionar nova música à lista de músicas
            musicLibrary.push(newMusic);
        }

        // Salvar a lista de músicas no armazenamento local
        saveMusicLibraryToLocalStorage();

        // Limpar o formulário
        $('#musicForm')[0].reset();
        $('#musicModal').modal('hide');

        // Atualizar a exibição da biblioteca de músicas
        loadLibrary();
    }

    // Enviar o formulário de adição de faixas
    $('#musicForm').submit(function(event) {
        event.preventDefault();
        
        // Obtém o id do card a ser editado (se existir)
        const cardId = $(this).data('cardId');
        
        // Verifica se é edição ou adição e chama a função correspondente
        if (cardId) {
            addOrEditMusic(true, cardId);
        } else {
            addOrEditMusic(false);
        }
    });

    // Abre o modal para adicionar nova faixa
    $('#openAddFormBtn').click(function() {
        $('#songName').val('');
        $('#artist').val('');
        $('#albumName').val('');
        $('#coverUrl').val('');
        $('#audioFileName').text('Selecione um arquivo...');
        $('#audioFile').val('');

        // Atualiza o título do modal
        $('#musicModalLabel').text('Adicionar Faixa');
        // Atualiza o texto do botão submit
        $('#chooseAudioFileBtn').text('Adicionar');
        $('#musicModalSubmitBtn').text('Adicionar nova faixa');
        $('#musicForm').removeData('cardId');
        $('#musicModal').modal('show');
    });

    // Adiciona evento de clique para o botão de edição
    $(document).on('click', '.editButtonCard', function() {
        const cardId = $(this).closest('.card').attr('id');
        const song = musicLibrary.find(song => song.id === cardId);

        // Preenche o formulário com os valores atuais do card
        $('#songName').val(song.songName);
        $('#artist').val(song.artist);
        $('#albumName').val(song.albumName);
        $('#coverUrl').val(song.coverUrl);
        
        // Exibe o nome do arquivo .mp3 da música selecionada
        $('#audioFileName').text(song.audioFile);

        // Atualiza o id do card no formulário
        $('#musicForm').data('cardId', cardId);

        // Atualiza o título do modal
        $('#musicModalLabel').text('Editar Faixa');
        $('#chooseAudioFileBtn').text('Alterar');
        // Atualiza o texto do botão submit
        $('#musicModalSubmitBtn').text('Salvar Alterações');

        // Abre o modal de adição/editação
        $('#musicModal').modal('show');
    });

    loadMusicLibraryFromLocalStorage();
    loadPlaylistFromLocalStorage();
    loadLibrary();
    loadPlaylist();
});