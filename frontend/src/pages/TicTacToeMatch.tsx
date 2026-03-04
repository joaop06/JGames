import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { api, type TicTacToeMatchState } from '../api/client';
import { getUserMessage } from '../lib/userMessages';
import Board from '../components/tic-tac-toe/Board';
import TicTacToeIcon from '../components/tic-tac-toe/TicTacToeIcon';
import { Alert, Button, Card } from '../components/ui';

const emptyState: TicTacToeMatchState = {
  id: '',
  gameType: 'tic_tac_toe',
  status: 'waiting',
  winnerId: null,
  playerX: undefined,
  playerO: null,
  board: [null, null, null, null, null, null, null, null, null],
  currentTurn: 'X',
  moves: [],
};

export default function TicTacToeMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connection, subscribe, isConnected } = useRealtime();
  const [state, setState] = useState<TicTacToeMatchState>(emptyState);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [rematchStatus, setRematchStatus] = useState<
    'idle' | 'waiting_opponent' | 'opponent_requested'
  >('idle');
  const [rematchExpiresAt, setRematchExpiresAt] = useState<number | null>(null);
  const [rematchFromUsername, setRematchFromUsername] = useState<string | null>(null);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [addFriendStatus, setAddFriendStatus] = useState<
    'idle' | 'loading' | 'sent' | 'already_friends'
  >('idle');

  const myRole: 'X' | 'O' | null =
    user && state.playerX?.id === user.id
      ? 'X'
      : user && state.playerO?.id === user.id
        ? 'O'
        : null;

  const handleMessage = useCallback(
    (msg: import('../api/ws').WsMessage) => {
      if (msg.type === 'match_state') {
        setState({
          id: msg.id,
          gameType: msg.gameType ?? 'tic_tac_toe',
          status: msg.status,
          winnerId: msg.winnerId ?? null,
          playerX: msg.playerX,
          playerO: msg.playerO ?? null,
          board: msg.board ?? emptyState.board,
          currentTurn: msg.currentTurn ?? 'X',
          moves: msg.moves ?? [],
        });
        setError(null);
        setConnecting(false);
      } else if (msg.type === 'match_ended') {
        navigate('/games/tic-tac-toe');
      } else if (msg.type === 'error') {
        setError(getUserMessage(msg.message ?? msg.code ?? ''));
        setConnecting(false);
      } else if (msg.type === 'rematch_pending') {
        setRematchStatus('waiting_opponent');
        setRematchExpiresAt(msg.expiresAt);
        setRematchFromUsername(null);
      } else if (msg.type === 'rematch_requested') {
        setRematchStatus('opponent_requested');
        setRematchExpiresAt(msg.expiresAt);
        setRematchFromUsername(msg.fromUser?.username ?? 'Oponente');
      } else if (msg.type === 'rematch_expired') {
        setRematchStatus('idle');
        setRematchExpiresAt(null);
        setRematchFromUsername(null);
        navigate('/games/tic-tac-toe');
      } else if (msg.type === 'rematch_ready') {
        setRematchStatus('idle');
        setRematchExpiresAt(null);
        setRematchFromUsername(null);
        navigate(`/games/tic-tac-toe/match/${msg.matchId}`);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (!matchId) return;
    const unsub = subscribe(handleMessage);
    return () => {
      unsub();
      connection.send({ type: 'leave_match' });
      setRematchStatus('idle');
      setRematchExpiresAt(null);
      setRematchFromUsername(null);
    };
  }, [matchId, subscribe, handleMessage, connection]);

  useEffect(() => {
    if (state.status !== 'finished') {
      setRematchStatus('idle');
      setRematchExpiresAt(null);
      setRematchFromUsername(null);
    }
  }, [state.status]);

  useEffect(() => {
    if (matchId && isConnected) {
      connection.send({ type: 'join_match', matchId });
    }
  }, [matchId, isConnected, connection]);

  const handleCellClick = (position: number) => {
    if (!connection.isConnected() || !matchId) return;
    connection.send({ type: 'move', matchId, position });
  };

  const opponentName =
    myRole === 'X'
      ? (state.playerO?.username ?? 'Aguardando...')
      : (state.playerX?.username ?? 'Aguardando...');

  const opponent =
    state.playerX && state.playerO && user
      ? state.playerX.id === user.id
        ? state.playerO
        : state.playerX
      : null;

  useEffect(() => {
    if (state.status !== 'finished' || !opponent?.id) return;
    api
      .getFriends()
      .then((res) => {
        setFriendIds(new Set(res.friends.map((f) => f.id)));
      })
      .catch(() => {});
  }, [state.status, opponent?.id]);

  const handleAddFriend = async () => {
    if (!opponent?.username) return;
    setAddFriendStatus('loading');
    setError(null);
    try {
      await api.inviteFriend(opponent.username);
      setAddFriendStatus('sent');
    } catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : '') || '';
      if (msg.includes('Already friends') || msg.includes('já são amigos')) {
        setAddFriendStatus('already_friends');
      } else if (msg.includes('Invite already sent') || msg.includes('Convite já enviado')) {
        setAddFriendStatus('sent');
      } else {
        setError(getUserMessage(msg) || 'Não foi possível enviar convite.');
        setAddFriendStatus('idle');
      }
    }
  };

  const handleJogarNovamente = () => {
    if (!matchId) return;
    setError(null);
    if (rematchStatus === 'idle') {
      connection.send({ type: 'rematch_request', matchId });
    } else if (rematchStatus === 'opponent_requested') {
      connection.send({ type: 'rematch_accept', matchId });
    }
  };

  const [rematchCountdown, setRematchCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (rematchExpiresAt == null || rematchStatus === 'idle') {
      setRematchCountdown(null);
      return;
    }
    const tick = () => {
      const secs = Math.max(0, Math.ceil((rematchExpiresAt - Date.now()) / 1000));
      setRematchCountdown(secs);
      if (secs <= 0) {
        setRematchExpiresAt(null);
        setRematchStatus('idle');
        navigate('/games/tic-tac-toe');
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [rematchExpiresAt, rematchStatus, navigate]);

  if (!matchId) {
    return (
      <div className="tic-tac-toe-match">
        <header className="tic-tac-toe-match__hero">
          <TicTacToeIcon className="tic-tac-toe-match__hero-icon" />
          <h1>Jogo da Velha</h1>
        </header>
        <Card style={{ marginBottom: 'var(--space-4)' }}>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 var(--space-4)' }}>
            Partida não encontrada.
          </p>
          <Button
            variant="ghost"
            className="lobby-btn"
            onClick={() => navigate('/games/tic-tac-toe')}
          >
            Voltar ao lobby
          </Button>
        </Card>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="tic-tac-toe-match">
        <header className="tic-tac-toe-match__hero">
          <TicTacToeIcon className="tic-tac-toe-match__hero-icon" />
          <h1>Jogo da Velha</h1>
        </header>
        <div className="tic-tac-toe-match__status" role="status">
          Conectando à partida...
        </div>
      </div>
    );
  }

  const isFinished = state.status === 'finished';
  const winnerName = state.winnerId
    ? state.playerX?.id === state.winnerId
      ? state.playerX?.username
      : state.playerO?.username
    : null;

  const statusText =
    state.status === 'waiting'
      ? 'Aguardando segundo jogador...'
      : state.status === 'in_progress' && !state.winnerId
        ? myRole === state.currentTurn
          ? 'Sua vez!'
          : `Vez de ${opponentName}`
        : isFinished
          ? state.winnerId
            ? state.winnerId === user?.id
              ? 'Você venceu!'
              : `${winnerName ?? 'Oponente'} venceu!`
            : 'Empate!'
          : '';

  return (
    <div className="tic-tac-toe-match">
      <header className="tic-tac-toe-match__hero">
        <TicTacToeIcon className="tic-tac-toe-match__hero-icon" />
        <h1>Jogo da Velha</h1>
        <Button
          variant="ghost"
          size="sm"
          className="tic-tac-toe-match__back-btn"
          onClick={() => navigate('/games/tic-tac-toe')}
        >
          ← Lobby
        </Button>
      </header>

      {error && (
        <Alert variant="error" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </Alert>
      )}

      <div className="tic-tac-toe-match__status" role="status">
        {statusText}
      </div>

      <div className="tic-tac-toe-match__board-wrap">
        <Board
          board={state.board}
          currentTurn={state.currentTurn}
          status={state.status}
          winnerId={state.winnerId}
          myRole={myRole}
          onCellClick={handleCellClick}
          disabled={isFinished}
        />
      </div>

      {isFinished && (
        <Card glow style={{ padding: 'var(--space-5)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--size-lg)',
              margin: '0 0 var(--space-4)',
            }}
          >
            Partida encerrada
          </h2>
          {(rematchStatus === 'waiting_opponent' || rematchStatus === 'opponent_requested') && (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 'var(--size-sm)',
                margin: '0 0 var(--space-3)',
              }}
            >
              {rematchStatus === 'waiting_opponent'
                ? 'Aguardando confirmação do oponente...'
                : rematchFromUsername
                  ? `${rematchFromUsername} quer jogar novamente.`
                  : 'Oponente quer jogar novamente.'}
              {rematchCountdown != null && rematchCountdown >= 0 && (
                <span style={{ display: 'block', marginTop: 'var(--space-2)' }}>
                  Redirecionando ao lobby em {rematchCountdown}s...
                </span>
              )}
            </p>
          )}
          <div className="tic-tac-toe-match__actions">
            <Button
              className="lobby-btn"
              onClick={handleJogarNovamente}
              disabled={rematchStatus === 'waiting_opponent'}
            >
              Jogar novamente
            </Button>
            {opponent && !friendIds.has(opponent.id) && (
              <>
                {addFriendStatus === 'idle' && (
                  <Button variant="ghost" size="sm" className="lobby-btn" onClick={handleAddFriend}>
                    Adicionar como amigo
                  </Button>
                )}
                {addFriendStatus === 'loading' && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--size-sm)' }}>
                    Enviando convite...
                  </span>
                )}
                {addFriendStatus === 'sent' && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--size-sm)' }}>
                    Convite enviado
                  </span>
                )}
                {addFriendStatus === 'already_friends' && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--size-sm)' }}>
                    Já são amigos
                  </span>
                )}
              </>
            )}
            {opponent && (
              <Button
                variant="ghost"
                size="sm"
                className="lobby-btn"
                onClick={() => navigate('/games/tic-tac-toe')}
              >
                Voltar ao lobby
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
