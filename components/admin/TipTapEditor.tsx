'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useCallback } from 'react';
import {
    LuBold, LuItalic, LuUnderline, LuStrikethrough, LuList, LuListOrdered,
    LuQuote, LuCode, LuAlignLeft, LuAlignCenter, LuAlignRight,
    LuHeading1, LuHeading2, LuHeading3, LuImage, LuLink, LuMinus, LuUndo, LuRedo
} from 'react-icons/lu';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface TipTapEditorProps {
    content: Record<string, unknown>;
    onChange: (content: Record<string, unknown>) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder: 'Start writing your article...',
            }),
            ImageExtension.configure({
                HTMLAttributes: { class: 'article-image' },
            }),
            LinkExtension.configure({
                openOnClick: false,
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: content && Object.keys(content).length > 0 ? content : undefined,
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON() as Record<string, unknown>);
        },
    });

    // Sync content when editing existing article
    useEffect(() => {
        if (editor && content && Object.keys(content).length > 0 && !editor.isFocused) {
            const currentContent = editor.getJSON();
            if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    const addImage = useCallback(async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            try {
                const supabase = createClient();
                const ext = file.name.split('.').pop();
                const path = `${Date.now()}.${ext}`;
                const { error } = await supabase.storage.from('article_content_images').upload(path, file);
                if (error) throw error;
                const { data: urlData } = supabase.storage.from('article_content_images').getPublicUrl(path);
                editor?.chain().focus().setImage({ src: urlData.publicUrl }).run();
                toast.success('Image inserted');
            } catch {
                toast.error('Failed to upload image');
            }
        };
        input.click();
    }, [editor]);

    const setLink = useCallback(() => {
        const previousUrl = editor?.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    const ToolbarButton = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
        <button
            type="button"
            onClick={onClick}
            className={`p-1.5 rounded-md transition-all ${active ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <LuBold size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <LuItalic size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
                    <LuUnderline size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                    <LuStrikethrough size={16} />
                </ToolbarButton>

                <div className="w-px h-5 bg-border mx-1" />

                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
                    <LuHeading1 size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                    <LuHeading2 size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                    <LuHeading3 size={16} />
                </ToolbarButton>

                <div className="w-px h-5 bg-border mx-1" />

                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
                    <LuList size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
                    <LuListOrdered size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
                    <LuQuote size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
                    <LuCode size={16} />
                </ToolbarButton>

                <div className="w-px h-5 bg-border mx-1" />

                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Left Align">
                    <LuAlignLeft size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">
                    <LuAlignCenter size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Right Align">
                    <LuAlignRight size={16} />
                </ToolbarButton>

                <div className="w-px h-5 bg-border mx-1" />

                <ToolbarButton onClick={addImage} title="Insert Image">
                    <LuImage size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Insert Link">
                    <LuLink size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                    <LuMinus size={16} />
                </ToolbarButton>

                <div className="w-px h-5 bg-border mx-1" />

                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <LuUndo size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <LuRedo size={16} />
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}