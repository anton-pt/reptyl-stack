import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { ConversationEntity } from './conversation.entity.js';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'conversation_id', type: 'uuid', nullable: false })
  conversationId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ name: 'order_number', type: 'integer', nullable: false })
  orderNumber: number;

  @Column({
    type: 'enum',
    nullable: false,
    enum: ['user', 'assistant', 'system'],
  })
  role: 'user' | 'assistant' | 'system';

  @ManyToOne(
    'ConversationEntity',
    (conversation: ConversationEntity) => conversation.messages
  )
  @JoinColumn({ name: 'conversation_id' })
  conversation?: ConversationEntity;
}
