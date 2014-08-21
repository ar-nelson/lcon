" Vim syntax file
" Language: LCON
" Maintainer: Adam R. Nelson
" Latest Revision: August 20, 2014

setlocal iskeyword=!,#-&,*,+,-,/,48-57,<-?,A-Z,_,a-z,124,~,161-255

syn case match
syn sync minlines=200 maxlines=1000

syn match brace /\v[{}()]/
syn match bracket /\v[\[\]]/
syn match dot /\v^[ \t]*\zs[.]/

syn match uqstring /\v\k+/
syn region sqstring start=/'/ end=/'/ skip=/''/
syn region dqstring start=/"/ end=/"/ skip=/\\"/

syn match number /\v0b[01]+/
syn match number /\v0o[0-7]+/
syn match number /\v0x[\da-f]+/
syn match number /\v\d*\.?\d+([eE][+-]?\d+)?/

syn keyword bool true false
syn keyword null null

syn match linecomment /;[^\n]*$/

syn match sblock0 /\v(^[^`]*)@<=``.*\n/            nextgroup=sline1,sline2,sline3,sline4,sline5,sline6,sline7,sline8,sline9,sline10,sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock1 /\v(^[ \t.][^`]*)@<=``.*\n/      nextgroup=sline2,sline3,sline4,sline5,sline6,sline7,sline8,sline9,sline10,sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock2 /\v(^[ \t.]{2}[^`]*)@<=``.*\n/   nextgroup=sline3,sline4,sline5,sline6,sline7,sline8,sline9,sline10,sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock3 /\v(^[ \t.]{3}[^`]*)@<=``.*\n/   nextgroup=sline4,sline5,sline6,sline7,sline8,sline9,sline10,sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock4 /\v(^[ \t.]{4}[^`]*)@<=``.*\n/   nextgroup=sline5,sline6,sline7,sline8,sline9,sline10,sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock5 /\v(^[ \t.]{5}[^`]*)@<=``.*\n/   nextgroup=sline6,sline7,sline8,sline9,sline10,sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock6 /\v(^[ \t.]{6}[^`]*)@<=``.*\n/   nextgroup=sline7,sline8,sline9,sline10,sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock7 /\v(^[ \t.]{7}[^`]*)@<=``.*\n/   nextgroup=sline8,sline9,sline10,sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock8 /\v(^[ \t.]{8}[^`]*)@<=``.*\n/   nextgroup=sline9,sline10,sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock9 /\v(^[ \t.]{9}[^`]*)@<=``.*\n/   nextgroup=sline10,sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock10 /\v(^[ \t.]{10}[^`]*)@<=``.*\n/ nextgroup=sline11,sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock11 /\v(^[ \t.]{11}[^`]*)@<=``.*\n/ nextgroup=sline12,sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock12 /\v(^[ \t.]{12}[^`]*)@<=``.*\n/ nextgroup=sline13,sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock13 /\v(^[ \t.]{13}[^`]*)@<=``.*\n/ nextgroup=sline14,sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock14 /\v(^[ \t.]{14}[^`]*)@<=``.*\n/ nextgroup=sline15,sline16,sline17,sline18,sline19,sline20
syn match sblock15 /\v(^[ \t.]{15}[^`]*)@<=``.*\n/ nextgroup=sline16,sline17,sline18,sline19,sline20
syn match sblock16 /\v(^[ \t.]{16}[^`]*)@<=``.*\n/ nextgroup=sline17,sline18,sline19,sline20
syn match sblock17 /\v(^[ \t.]{17}[^`]*)@<=``.*\n/ nextgroup=sline18,sline19,sline20
syn match sblock18 /\v(^[ \t.]{18}[^`]*)@<=``.*\n/ nextgroup=sline19,sline20
syn match sblock19 /\v(^[ \t.]{19}[^`]*)@<=``.*\n/ nextgroup=sline20
syn match sblock20 /\v(^[ \t.]{19}[^`]*)@<=``.*\n/ " Beyond this point, indented lines won't be highlighted.

syn match sline1  /\v^[ \t].*\n/     contained nextgroup=sline1
syn match sline2  /\v^[ \t]{2}.*\n/  contained nextgroup=sline2
syn match sline3  /\v^[ \t]{3}.*\n/  contained nextgroup=sline3
syn match sline4  /\v^[ \t]{4}.*\n/  contained nextgroup=sline4
syn match sline5  /\v^[ \t]{5}.*\n/  contained nextgroup=sline5
syn match sline6  /\v^[ \t]{6}.*\n/  contained nextgroup=sline6
syn match sline7  /\v^[ \t]{7}.*\n/  contained nextgroup=sline7
syn match sline8  /\v^[ \t]{8}.*\n/  contained nextgroup=sline8
syn match sline9  /\v^[ \t]{9}.*\n/  contained nextgroup=sline9
syn match sline10 /\v^[ \t]{10}.*\n/ contained nextgroup=sline10
syn match sline11 /\v^[ \t]{11}.*\n/ contained nextgroup=sline11
syn match sline12 /\v^[ \t]{12}.*\n/ contained nextgroup=sline12
syn match sline13 /\v^[ \t]{13}.*\n/ contained nextgroup=sline13
syn match sline14 /\v^[ \t]{14}.*\n/ contained nextgroup=sline14
syn match sline15 /\v^[ \t]{15}.*\n/ contained nextgroup=sline15
syn match sline16 /\v^[ \t]{16}.*\n/ contained nextgroup=sline16
syn match sline17 /\v^[ \t]{17}.*\n/ contained nextgroup=sline17
syn match sline18 /\v^[ \t]{18}.*\n/ contained nextgroup=sline18
syn match sline19 /\v^[ \t]{19}.*\n/ contained nextgroup=sline19
syn match sline20 /\v^[ \t]{20}.*\n/ contained nextgroup=sline20

syn match cblock0 /\v(^[^;]*)@<=;[:].*\n/            nextgroup=cline1,cline2,cline3,cline4,cline5,cline6,cline7,cline8,cline9,cline10,cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock1 /\v(^[ \t.][^;]*)@<=;[:].*\n/      nextgroup=cline2,cline3,cline4,cline5,cline6,cline7,cline8,cline9,cline10,cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock2 /\v(^[ \t.]{2}[^;]*)@<=;[:].*\n/   nextgroup=cline3,cline4,cline5,cline6,cline7,cline8,cline9,cline10,cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock3 /\v(^[ \t.]{3}[^;]*)@<=;[:].*\n/   nextgroup=cline4,cline5,cline6,cline7,cline8,cline9,cline10,cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock4 /\v(^[ \t.]{4}[^;]*)@<=;[:].*\n/   nextgroup=cline5,cline6,cline7,cline8,cline9,cline10,cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock5 /\v(^[ \t.]{5}[^;]*)@<=;[:].*\n/   nextgroup=cline6,cline7,cline8,cline9,cline10,cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock6 /\v(^[ \t.]{6}[^;]*)@<=;[:].*\n/   nextgroup=cline7,cline8,cline9,cline10,cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock7 /\v(^[ \t.]{7}[^;]*)@<=;[:].*\n/   nextgroup=cline8,cline9,cline10,cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock8 /\v(^[ \t.]{8}[^;]*)@<=;[:].*\n/   nextgroup=cline9,cline10,cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock9 /\v(^[ \t.]{9}[^;]*)@<=;[:].*\n/   nextgroup=cline10,cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock10 /\v(^[ \t.]{10}[^;]*)@<=;[:].*\n/ nextgroup=cline11,cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock11 /\v(^[ \t.]{11}[^;]*)@<=;[:].*\n/ nextgroup=cline12,cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock12 /\v(^[ \t.]{12}[^;]*)@<=;[:].*\n/ nextgroup=cline13,cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock13 /\v(^[ \t.]{13}[^;]*)@<=;[:].*\n/ nextgroup=cline14,cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock14 /\v(^[ \t.]{14}[^;]*)@<=;[:].*\n/ nextgroup=cline15,cline16,cline17,cline18,cline19,cline20
syn match cblock15 /\v(^[ \t.]{15}[^;]*)@<=;[:].*\n/ nextgroup=cline16,cline17,cline18,cline19,cline20
syn match cblock16 /\v(^[ \t.]{16}[^;]*)@<=;[:].*\n/ nextgroup=cline17,cline18,cline19,cline20
syn match cblock17 /\v(^[ \t.]{17}[^;]*)@<=;[:].*\n/ nextgroup=cline18,cline19,cline20
syn match cblock18 /\v(^[ \t.]{18}[^;]*)@<=;[:].*\n/ nextgroup=cline19,cline20
syn match cblock19 /\v(^[ \t.]{19}[^;]*)@<=;[:].*\n/ nextgroup=cline20
syn match cblock20 /\v(^[ \t.]{19}[^;]*)@<=;[:].*\n/ " Beyond this point, indented lines won't be highlighted.

syn match cline1  /\v^[ \t].*\n/     contained nextgroup=cline1
syn match cline2  /\v^[ \t]{2}.*\n/  contained nextgroup=cline2
syn match cline3  /\v^[ \t]{3}.*\n/  contained nextgroup=cline3
syn match cline4  /\v^[ \t]{4}.*\n/  contained nextgroup=cline4
syn match cline5  /\v^[ \t]{5}.*\n/  contained nextgroup=cline5
syn match cline6  /\v^[ \t]{6}.*\n/  contained nextgroup=cline6
syn match cline7  /\v^[ \t]{7}.*\n/  contained nextgroup=cline7
syn match cline8  /\v^[ \t]{8}.*\n/  contained nextgroup=cline8
syn match cline9  /\v^[ \t]{9}.*\n/  contained nextgroup=cline9
syn match cline10 /\v^[ \t]{10}.*\n/ contained nextgroup=cline10
syn match cline11 /\v^[ \t]{11}.*\n/ contained nextgroup=cline11
syn match cline12 /\v^[ \t]{12}.*\n/ contained nextgroup=cline12
syn match cline13 /\v^[ \t]{13}.*\n/ contained nextgroup=cline13
syn match cline14 /\v^[ \t]{14}.*\n/ contained nextgroup=cline14
syn match cline15 /\v^[ \t]{15}.*\n/ contained nextgroup=cline15
syn match cline16 /\v^[ \t]{16}.*\n/ contained nextgroup=cline16
syn match cline17 /\v^[ \t]{17}.*\n/ contained nextgroup=cline17
syn match cline18 /\v^[ \t]{18}.*\n/ contained nextgroup=cline18
syn match cline19 /\v^[ \t]{19}.*\n/ contained nextgroup=cline19
syn match cline20 /\v^[ \t]{20}.*\n/ contained nextgroup=cline20

hi def link uqstring Identifier
hi def link sqstring String
hi def link dqstring String

hi def link brace Function
hi def link bracket Structure
hi def link dot Structure

hi def link bool Boolean
hi def link null Keyword

hi def link linecomment Comment

hi def link sblock0 String
hi def link sblock1 String
hi def link sblock2 String
hi def link sblock3 String
hi def link sblock4 String
hi def link sblock5 String
hi def link sblock6 String
hi def link sblock7 String
hi def link sblock8 String
hi def link sblock9 String
hi def link sblock10 String
hi def link sblock11 String
hi def link sblock12 String
hi def link sblock13 String
hi def link sblock14 String
hi def link sblock15 String
hi def link sblock16 String
hi def link sblock17 String
hi def link sblock18 String
hi def link sblock19 String
hi def link sblock20 String

hi def link sline1 String
hi def link sline2 String
hi def link sline3 String
hi def link sline4 String
hi def link sline5 String
hi def link sline6 String
hi def link sline7 String
hi def link sline8 String
hi def link sline9 String
hi def link sline10 String
hi def link sline11 String
hi def link sline12 String
hi def link sline13 String
hi def link sline14 String
hi def link sline15 String
hi def link sline16 String
hi def link sline17 String
hi def link sline18 String
hi def link sline19 String
hi def link sline20 String

hi def link cblock0 Comment
hi def link cblock1 Comment
hi def link cblock2 Comment
hi def link cblock3 Comment
hi def link cblock4 Comment
hi def link cblock5 Comment
hi def link cblock6 Comment
hi def link cblock7 Comment
hi def link cblock8 Comment
hi def link cblock9 Comment
hi def link cblock10 Comment
hi def link cblock11 Comment
hi def link cblock12 Comment
hi def link cblock13 Comment
hi def link cblock14 Comment
hi def link cblock15 Comment
hi def link cblock16 Comment
hi def link cblock17 Comment
hi def link cblock18 Comment
hi def link cblock19 Comment
hi def link cblock20 Comment

hi def link cline1 Comment
hi def link cline2 Comment
hi def link cline3 Comment
hi def link cline4 Comment
hi def link cline5 Comment
hi def link cline6 Comment
hi def link cline7 Comment
hi def link cline8 Comment
hi def link cline9 Comment
hi def link cline10 Comment
hi def link cline11 Comment
hi def link cline12 Comment
hi def link cline13 Comment
hi def link cline14 Comment
hi def link cline15 Comment
hi def link cline16 Comment
hi def link cline17 Comment
hi def link cline18 Comment
hi def link cline19 Comment
hi def link cline20 Comment

