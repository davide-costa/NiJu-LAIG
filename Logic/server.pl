:-use_module(library(sockets)).
:-use_module(library(lists)).
:-use_module(library(codesio)).
:- include('ni-ju.pl').

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                        Server                                                   %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% To run, enter 'server.' on sicstus command line after consulting this file.
% You can test requests to this server by going to http://localhost:8081/<request>.
% Go to http://localhost:8081/quit to close server.

% Made by Luis Reis (ei12085@fe.up.pt) for LAIG course at FEUP.

port(8081).

% Server Entry Point
server :-
	port(Port),
	write('Opened Server'),nl,nl,
	socket_server_open(Port, Socket),
	server_loop(Socket),
	socket_server_close(Socket),
	write('Closed Server'),nl.

% Server Loop 
% Uncomment writes for more information on incomming connections
server_loop(Socket) :-
	repeat,
	socket_server_accept(Socket, _Client, Stream, [type(text)]),
		write('Accepted connection'), nl,
	    % Parse Request
		catch((
			read_request(Stream, Request),
			read_header(Stream)
		),_Exception,(
			write('Error parsing request.'),nl,
			close_stream(Stream),
			fail
		)),
		
		% Generate Response
		handle_request(Request, MyReply, Status),
		format('Request: ~q~n',[Request]),
		format('Reply: ~q~n', [MyReply]),
		
		% Output Response
		format(Stream, 'HTTP/1.0 ~p~n', [Status]),
		format(Stream, 'Access-Control-Allow-Origin: *~n', []),
		format(Stream, 'Content-Type: text/plain~n~n', []),
		format(Stream, '~p', [MyReply]),
	
		% write('Finnished Connection'),nl,nl,
		close_stream(Stream),
	(Request = quit), !.
	
close_stream(Stream) :- flush_output(Stream), close(Stream).

% Handles parsed HTTP requests
% Returns 200 OK on successful aplication of parse_input on request
% Returns 400 Bad Request on syntax error (received from parser) or on failure of parse_input
handle_request(Request, MyReply, '200 OK') :- catch(parse_input(Request, MyReply),error(_,_),fail), !.
handle_request(syntax_error, [-1], '400 Bad Request') :- !.
handle_request(_, [-1], '400 Bad Request').

% Reads first Line of HTTP Header and parses request
% Returns term parsed from Request-URI
% Returns syntax_error in case of failure in parsing
read_request(Stream, Request) :-
	read_line(Stream, LineCodes),
	print_header_line(LineCodes),
	
	% Parse Request
	atom_codes('GET /',Get),
	append(Get,RL,LineCodes),
	read_request_aux(RL,RL2),	
	
	catch(read_from_codes(RL2, Request), error(syntax_error(_),_), fail), !.
read_request(_,syntax_error).
	
read_request_aux([32|_],[46]) :- !.
read_request_aux([C|Cs],[C|RCs]) :- read_request_aux(Cs, RCs).


% Reads and Ignores the rest of the lines of the HTTP Header
read_header(Stream) :-
	repeat,
	read_line(Stream, Line),
	print_header_line(Line),
	(Line = []; Line = end_of_file),!.

check_end_of_header([]) :- !, fail.
check_end_of_header(end_of_file) :- !,fail.
check_end_of_header(_).

% Function to Output Request Lines (uncomment the line bellow to see more information on received HTTP Requests)
% print_header_line(LineCodes) :- catch((atom_codes(Line,LineCodes),write(Line),nl),_,fail), !.
print_header_line(_).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                       Commands                                                  %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Require your Prolog Files here

parse_input(handshake, handshake).
parse_input(stuff, stuff).
parse_input(Input, Response) :- 
	nth0(0, Input, RequestType),
	%write(RequestType),
	handleRequestByType(RequestType, Input, Response).
parse_input(quit, goodbye).

list_string_with_commas([],"").
list_string_with_commas([H,T],S):-
    swritef(SH,"%t, ",[H]),
    list_string_with_commas(T,ST),
    string_concat(SH,ST,T).




handleRequestByType(1, ParsedInput, Response) :-
	nth0(1, ParsedInput, Board),
	nth0(2, ParsedInput, Tile),
	nth0(3, ParsedInput, Row),
	nth0(4, ParsedInput, Col),
	((
		validMove(Board, Row, Col),!,
		niJuHumano(Board, Tile, Row, Col, RearrangedBoard, EndOfGame),
		length(Response, 3),
		nth0(0, Response, 0),
		nth0(1, Response, RearrangedBoard),
		nth0(2, Response, EndOfGame)
	);
	Response = [-1]).
	

handleRequestByType(2, ParsedInput, Response) :-
	handleRequestToIAPlay(0, ParsedInput, Response).

handleRequestByType(3, ParsedInput, Response) :-
	handleRequestToIAPlay(1, ParsedInput, Response).

handleRequestToIAPlay(Nivel, ParsedInput, Response) :-
	nth0(1, ParsedInput, Board),
	nth0(2, ParsedInput, CurrPlayerTiles),
	niJuComputador(Nivel, Board, CurrPlayerTiles, ChoosenTile, RearrangedBoard, EndOfGame),
	length(Response, 4),
	nth0(0, Response, 0),
	nth0(1, Response, RearrangedBoard),
	nth0(2, Response, EndOfGame),
	nth0(3, Response, ChoosenTile).
	
	

	