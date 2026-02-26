'use client';

import { Editor } from '@tinymce/tinymce-react';

export function TinyEditor({ value, onChange, height = 300, placeholder = '' }) {
    return (
        <div className="border rounded-md overflow-hidden bg-white shadow-sm">
            <Editor
                apiKey='zfwnodk88l8cyphy52iust4mcbx7gguhvj276s1ettlbuo31' // Default for trial/open source (shows warning but works)
                init={{
                    height: height,
                    menubar: false,
                    placeholder: placeholder,
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                        'bold italic underline | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                    content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:14px; color: #1e293b; }'
                }}
                value={value}
                onEditorChange={(content) => onChange(content)}
            />
        </div>
    );
}
