import json
import time
import regex
from typing import Optional, Union
from lark import Lark
from concurrent.futures import ThreadPoolExecutor

json_grammar = r"""
    ?start: value

    ?value: object
          | array
          | string
          | "true"             -> true
          | "false"            -> false
          | "null"             -> null

    array  : "[" [value ("," value)*] "]"
    object : "{" [pair ("," pair)*] "}"
    pair   : string ":" value

    string : ESCAPED_STRING

    %import common.ESCAPED_STRING
    %import common.SIGNED_NUMBER
    %import common.WS

    %ignore WS
"""
grammar = json_grammar

### Create the JSON parser with Lark, using the LALR algorithm
parser = Lark(grammar, parser='lalr',
                # Using the basic lexer isn't required, and isn't usually recommended.
                   # But, it's good enough for JSON, and it's slightly faster.
                   lexer='basic',
                   # Disabling propagate_positions and placeholders slightly improves speed
                   propagate_positions=False,
                   maybe_placeholders=False,
                   regex=True)

def dump(input):
    if isinstance(input, set):
        return json.dumps(list(input))
    return json.dumps(input)

def extract_terminal_regex(parser):
    regex_map = {}
    for term in parser.terminals:
        if term.pattern:
            # print(term.pattern)
            # regex_map[term.name] = regex.compile(term.pattern.to_regexp())
            regex_map[term.name] = term.pattern.to_regexp()
    
    return regex_map

def get_accepts(input: str) -> set[str]:
    interactive = parser.parse_interactive(input)
    interactive.exhaust_lexer()
    return interactive.accepts()

def get_are_we_in_open_string(input: str) -> Optional[str]:
    open_string = False
    open_string_kind = None
    prev_was_slash = False
    for char in input:
        if (char == '"' or char == "'") and prev_was_slash is False:
            if open_string_kind is None or open_string_kind == char:
                # print(char, prev_was_slash)
                open_string_kind = char
                open_string = open_string == False
            
        prev_was_slash = False
        if char == '\\':
            prev_was_slash = True
    return open_string_kind

class ReTokenFilter:
    vocab: list[str]
    def __init__(self, vocab: list[str]):
        self.vocab = vocab

    def is_valid_token(self, decoded_token: str, partial_completion: str) -> bool:
        if decoded_token is None or decoded_token.strip() == '': # don't allow an empty string
            return False
        proposed_program = partial_completion + decoded_token
        try:
            get_accepts(proposed_program)
            return True
        except:
            # print(f'Proposed program was invalid: "{proposed_program}"')
            # are we in an open string?
            open_string_kind = get_are_we_in_open_string(proposed_program)
            # are_we_in_string = False

            if open_string_kind:
                # check if _closing_ that string would result in a valid program
                try:
                    get_accepts(proposed_program + open_string_kind)
                    return True
                except:
                    return False
                # return False
                # # print('program', partial_completion + decoded_token, 'is invalid, check regex')
                # # check the regexes too

                # pattern = parser.terminals[0].pattern.to_regexp() # check partial string
                # pattern = regex.compile(f'^\s*{pattern}')
                # match = pattern.fullmatch(decoded_token, partial=True)
                # # print(decoded_token, 'matches', match)
                # return match
            else:
                return False

            # for pattern in patterns:
            #     if pattern == '<|endoftext|>':
            #     # if isinstance(pattern, str):
            #         match = pattern == partial_completion
            #     else:
            #         pattern = regex.compile(f'^\s*{pattern}')
            #         match = pattern.fullmatch(decoded_token, partial=True)
            #     matches.append(match)
            # return any(matches)
            # return False
        # # full_prompt = partial_completion + decoded_token
        # full_prompt = decoded_token
        # # print("check patterns", patterns, "against prompt", full_prompt)
        # matches: list[bool] = []
        # for pattern in patterns:
        #     if pattern == '<|endoftext|>':
        #     # if isinstance(pattern, str):
        #         match = pattern == partial_completion
        #     else:
        #         pattern = regex.compile(f'^\s*{pattern}')
        #         match = pattern.fullmatch(full_prompt, partial=True)
        #     matches.append(match)
        # return any(matches)

    def filter_tokens(self, partial_completion: str) -> list[int]:
        print('filter_tokens')
        # if len(patterns) == 1 and patterns[0] == '<|endoftext|>':
        #     for token_id in range(len(self.vocab)):
        #         if self.is_valid_token(self.vocab[token_id], partial_completion, patterns):
        total = len(self.vocab)
        valid_token_ids: list[int] = []
        durations = []
        with ThreadPoolExecutor():
            for token_id in range(total):
                start_time = time.time()
                if self.is_valid_token(self.vocab[token_id], partial_completion):
                    valid_token_ids.append(token_id)
                elapsed_time = time.time() - start_time
                durations.append(elapsed_time)

            # return list(filter(lambda token_id: self.is_valid_token(token_id, partial_completion, patterns), self.vocab))
        sum = 0
        for duration in durations:
            sum += duration
        sum /= total
        print('Average duration:', sum, 'for', total)
        return valid_token_ids
        
def get_valid_token_ids(input: str, token_filter: ReTokenFilter) -> list[int]:
    # print('input:', input)
    # valid_next_lex = get_accepts(input)
    # print('valid next lex', valid_next_lex, 'for input', input)
    # r = [terminal_regexes[t] for t in valid_next_lex]
    # print('r', r)
    # print('filter tokens for input', input)
    filtered_tokens = token_filter.filter_tokens(input)
    # print('filtered_tokens', filtered_tokens)
    return filtered_tokens


# terminal_regexes = extract_terminal_regex(parser)
