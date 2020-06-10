import chess.pgn

class OverriddenGameBuilder(chess.pgn.GameBuilder):
    def handle_error(self, error):
        raise
