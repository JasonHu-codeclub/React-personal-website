import React, {memo, useCallback, useEffect, useMemo, useState} from 'react'
import tw from "twin.macro";
import {useNavigate, useParams} from "react-router-dom";
import githubService from "../services/githubService.ts";
import useHandling from "../hooks/useHandling.ts";
import {format} from "date-fns";
import {useTranslation} from "react-i18next";
import Skeleton from "../components/Skeleton.tsx";
import LabelItem from "../components/LabelItem.tsx";
import MarkdownHtml from "../components/MarkdownHtml.tsx";
import CommentSkeleton from '../components/CommentSkeleton.tsx'
import {createQueryURL} from "../utils.ts";
import IconComments from "~icons/ri/chat-2-line";
import ArticleModel from "../models/ArticleModel.ts";
import CommentModel from '../models/CommentModel';
import useQuery from "../hooks/useQuery.ts";
import CommentItem from "../components/CommentItem.tsx";
import Pagination from "../components/Pagination.tsx";

const Wrapper = tw.article`mx-auto w-full max-w-screen-lg px-8 py-12`;
const ParagraphSkeleton = tw.ul`mt-8 space-y-4`;

const Title = tw.h2`text-2xl text-slate-700`;
const Info = tw.div`mt-4 mb-8 space-x-4 flex flex-wrap content-center text-sm text-slate-400`;
const CommentTitle = tw.h2`text-2xl text-slate-700`;
//leading-10 = line-height:2.5rem
const CommentButton = tw.a`mt-4 block max-w-8 w-full h-10 mx-auto leading-10 text-slate-400 text-center border border-gray-400 rounded-sm cursor-pointer`

const Foot = tw.div`mt-8 flex justify-center`;

function useArticle() {
    const {id} = useParams();
    const [article, setArticle] = useState<ArticleModel>();


    const [loading, load] = useHandling(
        useCallback(async () => {
            const result = await githubService.getIssue(parseInt(id!, 10));
            setArticle(ArticleModel.from(result));
        }, [id]),
        true,
    );


    useEffect(() => {
        load();
    }, [id]);

    return [loading, article] as const;
}

function useCommentsQuery() {
    const {id} = useParams();
    const {page} = useQuery();
    return useMemo(
        () => ({
            issue: parseInt(id!, 10),
            page: parseInt(page ?? '1', 10),
            pageSize: parseInt(import.meta.env.VITE_COMMENT_PAGE_SIZE, 10),
        }),
        [id, page],
    );
}

function useComments() {
    const query = useCommentsQuery();
    const [comments, setComments] = useState<CommentModel[]>([]);

    const [loading, load] = useHandling(
        useCallback(async () => {
            const result = await githubService.listComments(query);

            setComments(result.map(CommentModel.from));
        }, [query]),
        true,
    );

    useEffect(() => {
        load();
    }, [query]);

    return [loading, comments, query] as const;
}

export default memo(function Article() {
    const navigate = useNavigate();
    const {t} = useTranslation();

    const [articleLoading, article] = useArticle();
    const [commentsLoading, comments, query] = useComments();
    const createdAt = useMemo(() => {
        return article ? format(new Date(article.createdAt), t('dateFormat')) : '';
    }, [article]);

    const getLabelLink = useCallback((label: string) => {// generate a URL based on a given label
        return `../${createQueryURL({label, page: 1})}`;
    }, []);//依赖数组是空的，意味着回调函数或效果函数仅在组件的首次渲染时执行一次

    const newCommentUrl = useMemo(() => {
        return article ? `${article.htmlUrl}#new_comment_field` : '';
    }, [article]);

    const onPageChange = useCallback((page: number) => {
        navigate(createQueryURL({ page }));
    }, []);


    return (
        <Wrapper>
            <article>
                {articleLoading && (
                    <>
                        <Skeleton tw="h-8 w-1/3"/>
                        <ParagraphSkeleton>
                            <Skeleton tw="w-1/2"/>
                            <Skeleton tw="w-full"/>
                            <Skeleton tw="w-4/5"/>
                            <Skeleton tw="w-full"/>
                            <Skeleton tw="w-3/5"/>
                            <Skeleton tw="w-full h-40"/>
                            <Skeleton tw="w-4/5"/>
                            <Skeleton tw="w-full"/>
                            <Skeleton tw="w-3/5"/>
                            <Skeleton tw="w-full"/>
                            <Skeleton tw="w-2/5"/>
                        </ParagraphSkeleton>
                    </>
                )}
                {article && (
                    <>
                        <Title>{article.title}</Title>
                        <Info>
                            <span>{createdAt}</span>
                            <span tw={"flex items-center"}>
                                {article.labels.map((label) => (
                                    <LabelItem key={label.id} label={label} getLink={getLabelLink}/>
                                ))}
                            </span>
                            <span tw="flex items-center">
                                <IconComments/>
                                <span tw="ml-1">{article.comments}</span>
                            </span>
                        </Info>
                        <MarkdownHtml markdown={article.body} playground/>
                    </>
                )}
            </article>

            <section tw="mt-8">
                <CommentTitle>{t('comment.title')}</CommentTitle>
                <CommentButton href={newCommentUrl}>{t('comment.btn')}</CommentButton>
                {commentsLoading && (
                    <div>
                        {Array.from({length: 5}).map((_, i) => (
                            <CommentSkeleton key={i}/>
                        ))}
                    </div>
                )}
                {!!comments.length && (
                    <div>
                        {comments.map((comment) => (
                            <CommentItem comment={comment} key={comment.id}/>
                        ))}
                    </div>
                )}
                <Foot>
                    <Pagination
                        page={query.page}
                        pageSize={query.pageSize}
                        total={article ? article.comments : 0}
                        onChange={onPageChange}
                    />
                </Foot>
            </section>
        </Wrapper>
    )
})
