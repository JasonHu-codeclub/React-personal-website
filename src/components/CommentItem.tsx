import {format} from "date-fns";
import {useTranslation} from "react-i18next";
import {useMemo} from "react";
import tw from "twin.macro";
import CommentModel from "../models/CommentModel.ts";
import MarkdownHtml from "./MarkdownHtml.tsx";

const Wrapper = tw.div`relative mt-8 pt-8 pl-12 border-t border-gray-300 dark:border-gray-800`;

const Avatar = tw.div`absolute top-8 left-0 w-8 h-8 rounded-full overflow-hidden`;

const Header = tw.header`mb-2 space-x-4 flex items-center text-sm`;

const OwnerTag = tw.span`px-1 text-xs text-white leading-5 rounded-sm bg-blue-500`;

export type CommentItemProps = {
    comment:CommentModel
}
export default function CommentItem(props:CommentItemProps){
    const {comment} = props;
    const {t} = useTranslation();
    const createdAt = useMemo(() => {
        return format(new Date(comment.createdAt),'yyyy-MM-dd HH:mm:ss');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);
    const link = useMemo(() => {
        // origin 属性返回当前页面的协议（如 http: 或 https:）、域名（或IP地址）、端口号（如果指定了的话）的组合。
        // pathname 属性返回URL中的路径部分，即域名后的部分。对于同样的URL https://www.example.com:80/path/index.html，pathname 将是 /path/index.html。
        const {origin,pathname} = window.location;
        return [origin,pathname,`#${comment.id}`].join('');
    },[comment]);
    return (
        <Wrapper>
            <Avatar>
                <img src={comment.user.avatarUrl} alt="Avatar"/>
            </Avatar>
            <Header>
                <a href={comment.user.htmlUrl}>{comment.user.login}</a>
                {comment.authorAssociation === 'OWNER' && <OwnerTag>{t('comment.owner')}</OwnerTag>}
                <a href={link} tw="opacity-40 text-xs">
                    {createdAt}
                </a>
            </Header>
            <MarkdownHtml markdown={comment.body} />
        </Wrapper>
    )
}