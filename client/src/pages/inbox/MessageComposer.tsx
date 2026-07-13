/**
 * ============================================================
 * © 2025 Diploy — a brand of Bisht Technologies Private Limited
 * Original Author: BTPL Engineering Team
 * Website: https://diploy.in
 * Contact: cs@diploy.in
 *
 * Distributed under the Envato / CodeCanyon License Agreement.
 * Licensed to the purchaser for use as defined by the
 * Envato Market (CodeCanyon) Regular or Extended License.
 *
 * You are NOT permitted to redistribute, resell, sublicense,
 * or share this source code, in whole or in part.
 * Respect the author's rights and Envato licensing terms.
 * ============================================================
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Send,
  Paperclip,
  AlertCircle,
  Image,
  FileText,
} from "lucide-react";
import { TemplatePickerDialog } from "@/components/shared/TemplatePickerDialog";
import type { Conversation } from "@shared/schema";


interface MessageComposerProps {
  selectedConversation: Conversation;
  messageText: string;
  onTyping: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
  onFileAttachment: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectTemplate: (template: any, variables: { type?: string; value?: string }[], mediaId?: string, headerType?: string | null, buttonParameters?: string[], expirationTimeMs?: number, carouselCardMediaIds?: Record<number, string>) => void;
  is24HourWindowExpired: boolean;
  activeChannelId?: string;
  sendMessagePending: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const MessageComposer = ({
  selectedConversation,
  messageText,
  onTyping,
  onSendMessage,
  onFileAttachment,
  onFileChange,
  onSelectTemplate,
  is24HourWindowExpired,
  activeChannelId,
  sendMessagePending,
  fileInputRef,
}: MessageComposerProps) => {
  const [showExpiredMediaTip, setShowExpiredMediaTip] = useState(false);
  
  const isWhatsAppExpired = is24HourWindowExpired && selectedConversation.type === "whatsapp";
  
  const handleAttachmentClick = () => {
    if (isWhatsAppExpired) {
      setShowExpiredMediaTip(true);
      setTimeout(() => setShowExpiredMediaTip(false), 5000);
    } else {
      onFileAttachment();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-3 md:p-4">
      {isWhatsAppExpired && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm flex-1">
                <p className="font-medium text-yellow-800">
                  24-hour window expired
                </p>
                <p className="text-yellow-700">
                  Use <strong>template messages</strong> to continue the conversation. Templates with image/video headers let you send media.
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Image className="h-3.5 w-3.5 text-yellow-600" />
                <FileText className="h-3.5 w-3.5 text-yellow-600" />
              </div>
            </div>
          </div>
        )}
      
      {showExpiredMediaTip && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-2">
            <Image className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm flex-1">
              <p className="font-medium text-blue-800">
                Want to send images or videos?
              </p>
              <p className="text-blue-700">
                Click the <strong>Template</strong> button and choose a template with an image/video header. You can upload your media there!
              </p>
            </div>
            <button 
              onClick={() => setShowExpiredMediaTip(false)}
              className="text-blue-400 hover:text-blue-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-1 md:gap-2">
        <div className="flex gap-1">
          {selectedConversation.type === "whatsapp" && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 md:h-9 md:w-9 ${isWhatsAppExpired ? 'opacity-50' : ''}`}
                      onClick={handleAttachmentClick}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isWhatsAppExpired 
                      ? "Use templates with media headers" 
                      : "Attach File"
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                multiple
                onChange={onFileChange}
                accept="image/*,video/*"
              />

                <TemplatePickerDialog
                  channelId={activeChannelId}
                  onSelectTemplate={onSelectTemplate}
                />
            </>
          )}


          
        </div>

        

        <textarea
          placeholder={
            isWhatsAppExpired
              ? "Use templates to message →"
              : "Type a message..."
          }
          value={messageText}
          onChange={onTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = Math.min(target.scrollHeight, 120) + "px";
          }}
          disabled={isWhatsAppExpired}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: "36px", maxHeight: "120px" }}
        />

        <Button
          onClick={onSendMessage}
          disabled={
            !messageText.trim() || isWhatsAppExpired || sendMessagePending
          }
          size="icon"
          className="h-8 w-8 md:h-9 md:w-9 bg-emerald-500 hover:bg-emerald-600"
          data-testid="button-send-message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageComposer;
