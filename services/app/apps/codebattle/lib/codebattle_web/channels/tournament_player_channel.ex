defmodule CodebattleWeb.TournamentPlayerChannel do
  @moduledoc false
  use CodebattleWeb, :channel

  alias Codebattle.Tournament
  alias Codebattle.Tournament.Helpers

  def join("tournament_player:" <> tournament_player_ids, payload, socket) do
    current_user = socket.assigns.current_user
    [tournament_id, player_id] = String.split(tournament_player_ids, "_")
    player_id = String.to_integer(player_id)

    with tournament when not is_nil(tournament) <- Tournament.Context.get(tournament_id),
         true <- Tournament.Helpers.can_access?(tournament, current_user, payload) do
      Codebattle.PubSub.subscribe("tournament_player:#{tournament_id}_#{player_id}")
      Codebattle.PubSub.subscribe("tournament:#{tournament_id}")

      game_id = tournament |> Helpers.get_active_game_id(player_id)

      {:ok,
       %{
         game_id: game_id,
         tournament_id: tournament_id,
         tournament_state: tournament.state,
         tournament_break_state: tournament.break_state
       }, assign(socket, tournament_id: tournament_id, player_id: player_id)}
    else
      _ ->
        {:error, %{reason: "not_found"}}
    end
  end

  def terminate(_reason, socket) do
    {:noreply, socket}
  end

  def handle_info(%{event: "tournament:round_finished", payload: payload}, socket) do
    push(socket, "tournament:round_finished", payload)

    {:noreply, socket}
  end

  def handle_info(%{event: "game:created", payload: payload}, socket) do
    push(socket, "game:created", %{game_id: payload.game_id})

    {:noreply, socket}
  end

  def handle_info(_, state), do: {:noreply, state}
end