
getElement(Board, Row, Col, Element) :- 
   nth1(Row, Board, RowList),
   nth1(Col, RowList, Element).
 
 
 
ifThenElse(If, Then, _Else) :- 
	If, !, Then.
ifThenElse(_If, _Then, Else) :- 
	Else.
	
ifThen(If, Then) :-
	If, !, Then.
	
	
	
get_sublist(L1, L2, I, J):-
	get_sublist(L1, Temp, I, J, []),
    !,
    reverse(Temp, L2).
get_sublist([], L2, _I, _J, L2).
get_sublist(_L1, L2, I, J, L2):-
    I > J.
get_sublist(L1, L2, I, J, L2):-
    I < 0,
    get_sublist(L1, L2, 0, J, L2).
get_sublist([_L|Ls], L2, I, J, Acc):-
    I > 0,
    get_sublist(Ls, L2, I-1, J-1, Acc).
get_sublist([L|Ls], L2, I, J, Acc):-
    get_sublist(Ls, L2, I, J-1, [L|Acc]).
	
	
	
createRowOfEmptyTiles(Row, 0).
createRowOfEmptyTiles(Row, NumCols) :-
	emptyTile(EmptyTile),
	build(EmptyTile, NumCols, Row).
		
		
		
build(Elem, Num, List)  :- 
    length(List, Num), 
    maplist(=(Elem), List).
	
	
addTolist([], L, L).
addTolist([H|T], L, L1) :- 
	add(H, L2, L1), 
	addTolist(T, L, L2).
	
	
	
appendInAnotherList(List1, List2, Result) :-
	append([List1], [List2], Result). 
	
	
	
remove_duplicates([],[]).
remove_duplicates([H],[H]).
remove_duplicates([H ,H| T], List) :-
	remove_duplicates( [H|T], List).
remove_duplicates([H,Y | T], [H|T1]):- 
	Y \= H,
	remove_duplicates( [Y|T], T1).
	
	
remove_list([], _, []).
remove_list([X|Tail], L2, Result) :- 
	member(X, L2), !, remove_list(Tail, L2, Result). 
remove_list([X|Tail], L2, [X|Result]) :-
	remove_list(Tail, L2, Result).

	
copyListRemovingEmpties([],[]).
copyListRemovingEmpties([H|T1],[H|T2]) :-
	copyListRemovingEmpties(T1,T2).


not(Goal) :- call(Goal),!,fail.
not(Goal).


readYesOrNo(Response) :-
	read(Res),
	(((Res == 'y'; Res == 'n'), Response = Res); (nl, write('Unrecognized answer. Try again'), nl, readYesOrNo(Response))).



%=-----------------------%
%-   console utilities  -%
%------------------------%
pressEnterToContinue:-
	write('Press <Enter> to continue.'), nl,
	waitForEnter, !.

waitForEnter:-
	flush_output,
	get_char(_).

clearConsole:-
	clearConsole(40), !.

clearConsole(0).
clearConsole(N):-
	nl,
	N1 is N-1,
	clearConsole(N1).

getChar(Input):-
	get_char(Input),
	get_char(_).
	